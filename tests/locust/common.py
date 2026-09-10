"""Shared helpers for the three CartePro Locust suites (employee, admin, partner).

Kept in one module because all three sign in through the same Better Auth
endpoint and share the same sign-in rate limit and CSRF origin check.
"""

from __future__ import annotations

import csv
import itertools
import os
import threading
import time
from pathlib import Path

# Nest routes live behind this prefix plus a URI version
# (apps/backend/src/bootstrap.ts: API_PREFIX + enableVersioning).
API_PREFIX = "/api/v1"

# Better Auth is mounted outside the Nest prefix, unversioned (bootstrap.ts).
AUTH_SIGN_IN_PATH = "/auth/sign-in/email"

# Better Auth runs a CSRF origin check on state-changing calls: the Origin
# header must be in AUTH_TRUSTED_ORIGINS server-side (auth.ts, disableOriginCheck:
# false). The frontend dev origin is trusted by default (.env.example).
APP_ORIGIN = os.environ.get("LOCUST_APP_ORIGIN", "http://localhost:3000")

# Every account the recette dataset seeds shares this password
# (apps/backend/scripts/seed/dataset.ts, SEED_PASSWORD). Override for a
# differently-seeded database.
SEED_PASSWORD = os.environ.get("LOCUST_SEED_PASSWORD", "CartePro2026!")

# auth.constants.ts: SIGN_IN_RATE_LIMIT is 5 attempts / 60s, keyed by source IP
# and shared by every account — sign-in included, not just failed attempts.
# Several simulated users starting close together can land on an already-spent
# window through no fault of their own, so a 429 at login is retried rather
# than treated as a broken user. See README.md for recommended spawn rates.
LOGIN_MAX_ATTEMPTS = 8
LOGIN_RETRY_BACKOFF_SECONDS = 13


def load_accounts(csv_path: str) -> list[dict[str, str]]:
    """Reads an `email[,password]` CSV. A blank/missing password falls back to SEED_PASSWORD."""
    path = Path(csv_path)
    accounts: list[dict[str, str]] = []
    with path.open(newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            email = (row.get("email") or "").strip()
            if not email or email.startswith("#"):
                continue
            password = (row.get("password") or "").strip() or SEED_PASSWORD
            accounts.append({"email": email, "password": password})
    if not accounts:
        raise RuntimeError(f"No account found in {path} — seed the database first")
    return accounts


class AccountPool:
    """Round-robins a fixed credential list across concurrent Locust users.

    A bare itertools.cycle() is not safe to share between gevent greenlets
    without a lock: two users could read the same step and get the exact same
    account. Harmless here (Better Auth allows concurrent sessions on one
    account) but it defeats the point of spreading load across the pool.
    """

    def __init__(self, accounts: list[dict[str, str]]):
        self._cycle = itertools.cycle(accounts)
        self._lock = threading.Lock()

    def next(self) -> dict[str, str]:
        with self._lock:
            return next(self._cycle)


def sign_in(client, email: str, password: str, request_label: str) -> bool:
    """Logs in via POST /auth/sign-in/email; the session cookie stays on `client`.

    Retries on 429 rather than failing the user outright — see
    LOGIN_MAX_ATTEMPTS above for why a rate-limit hit during ramp-up is
    expected, not a defect.
    """
    for attempt in range(1, LOGIN_MAX_ATTEMPTS + 1):
        with client.post(
            AUTH_SIGN_IN_PATH,
            json={"email": email, "password": password},
            headers={"Origin": APP_ORIGIN},
            name=request_label,
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                response.success()
                return True
            if response.status_code == 429 and attempt < LOGIN_MAX_ATTEMPTS:
                response.success()
                time.sleep(LOGIN_RETRY_BACKOFF_SECONDS)
                continue
            response.failure(
                f"sign-in failed for {email}: {response.status_code} {response.text}"
            )
            return False
    return False
