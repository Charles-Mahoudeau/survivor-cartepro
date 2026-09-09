"""Classic 'partenaire' journey: check the shop profile, watch the application
status, and collect payments at the counter.

Collecting a payment needs a live employee-issued token, so this file also
signs in — through a plain `requests` session kept out of the partner's own
Locust stats, since it exists to set up state, not to be measured — as ONE
employee account from tests/locust/data/employees.csv, and mints a fresh
token from it on demand. That companion login shares the same rate-limited
window as every partner sign-in, so it stays a single extra account rather
than one per simulated partner. See tests/locust/README.md.

Run:
    locust -f tests/locust/partner_locustfile.py --host http://localhost:3001
"""

from __future__ import annotations

import os
import random
import threading
import time
from pathlib import Path

import requests
from locust import HttpUser, between, task
from locust.exception import StopUser

from common import (
    API_PREFIX,
    APP_ORIGIN,
    AUTH_SIGN_IN_PATH,
    LOGIN_MAX_ATTEMPTS,
    LOGIN_RETRY_BACKOFF_SECONDS,
    AccountPool,
    load_accounts,
    sign_in,
)

PARTNERS_DATA_FILE = Path(__file__).parent / "data" / "partners.csv"
EMPLOYEES_DATA_FILE = Path(__file__).parent / "data" / "employees.csv"

# tests/locust/data/partners.csv only lists ACTIVE partner owners: collecting
# a payment requires an active partner (PartnerService.getActiveIdByOwnerId),
# unlike the profile/application-status reads below.
PARTNER_ACCOUNTS = AccountPool(
    load_accounts(os.environ.get("LOCUST_PARTNER_ACCOUNTS", str(PARTNERS_DATA_FILE)))
)


class TokenIssuer:
    """Mints payment tokens through a single companion employee account.

    A plain `requests.Session`, not a Locust HttpUser: this exists to set up
    state for the partner scenario under test, not to be measured as part of
    it, and it must survive across every simulated partner without adding a
    sign-in per partner — the rate limit is shared, IP-wide, across accounts.
    """

    def __init__(self, host: str, email: str, password: str):
        self._host = host.rstrip("/")
        self._email = email
        self._password = password
        self._session = requests.Session()
        self._lock = threading.Lock()
        self._signed_in = False

    def _ensure_signed_in(self) -> bool:
        if self._signed_in:
            return True
        for attempt in range(1, LOGIN_MAX_ATTEMPTS + 1):
            response = self._session.post(
                f"{self._host}{AUTH_SIGN_IN_PATH}",
                json={"email": self._email, "password": self._password},
                headers={"Origin": APP_ORIGIN},
                timeout=10,
            )
            if response.status_code == 200:
                self._signed_in = True
                return True
            if response.status_code == 429 and attempt < LOGIN_MAX_ATTEMPTS:
                time.sleep(LOGIN_RETRY_BACKOFF_SECONDS)
                continue
            break
        return False

    def mint_short_code(self) -> str | None:
        """Issues a fresh token and returns its short code, or None on failure."""
        with self._lock:
            if not self._ensure_signed_in():
                return None
            response = self._session.post(
                f"{self._host}{API_PREFIX}/me/payment-tokens", timeout=10
            )
            if response.status_code != 201:
                return None
            return response.json()["shortCode"]


_issuer_lock = threading.Lock()
_issuer: TokenIssuer | None = None


def get_issuer(host: str) -> TokenIssuer:
    """Lazily builds the single shared TokenIssuer, once, for the whole run."""
    global _issuer
    with _issuer_lock:
        if _issuer is None:
            employee = load_accounts(
                os.environ.get("LOCUST_EMPLOYEE_ACCOUNTS", str(EMPLOYEES_DATA_FILE))
            )[0]
            _issuer = TokenIssuer(host, employee["email"], employee["password"])
        return _issuer


class PartnerUser(HttpUser):
    """One signed-in partner: checks the dashboard often, collects sometimes."""

    wait_time = between(3, 10)

    def on_start(self):
        self.profile = None
        account = PARTNER_ACCOUNTS.next()
        if not sign_in(
            self.client,
            account["email"],
            account["password"],
            "POST /auth/sign-in/email [partner]",
        ):
            raise StopUser()

    @task(5)
    def view_profile(self):
        with self.client.get(
            f"{API_PREFIX}/partners/me/profile",
            name=f"{API_PREFIX}/partners/me/profile",
            catch_response=True,
        ) as response:
            if response.status_code != 200:
                response.failure(f"unexpected status {response.status_code}")
                return
            response.success()
            self.profile = response.json()

    @task(3)
    def view_application_status(self):
        self.client.get(
            f"{API_PREFIX}/partners/applications/me",
            name=f"{API_PREFIX}/partners/applications/me",
        )

    @task(1)
    def resave_profile(self):
        """Patches the profile back onto itself — a form re-saved unchanged,
        exercised for real under load rather than skipped as a no-op.
        """
        if not self.profile:
            return
        self.client.patch(
            f"{API_PREFIX}/partners/me/profile",
            json={"tradeName": self.profile["tradeName"]},
            name=f"{API_PREFIX}/partners/me/profile [update]",
        )

    @task(4)
    def collect_payment(self):
        short_code = get_issuer(self.host).mint_short_code()
        if not short_code:
            return

        with self.client.post(
            f"{API_PREFIX}/payments",
            json={
                "shortCode": short_code,
                "amount": round(random.uniform(1, 25), 2),
                "partnerReference": f"caisse-locust-{random.randint(1, 9999)}",
            },
            name=f"{API_PREFIX}/payments [collect]",
            catch_response=True,
        ) as response:
            if response.status_code == 201:
                response.success()
                return
            if response.status_code == 400:
                # A shared, finite wallet balance makes an occasional refusal
                # (insufficient balance) an expected outcome under load, not a bug.
                response.success()
                return
            response.failure(f"unexpected status {response.status_code}")
