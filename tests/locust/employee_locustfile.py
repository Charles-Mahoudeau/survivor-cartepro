"""Classic 'salarié' (employee) journey: check the wallet, browse partners, pay.

Run:
    locust -f tests/locust/employee_locustfile.py --host http://localhost:3001

See tests/locust/README.md for the sign-in rate limit, recommended spawn
rates, and how to grow the account pool in tests/locust/data/employees.csv.
"""

import os
import random
from pathlib import Path

from locust import HttpUser, between, task
from locust.exception import StopUser

from common import API_PREFIX, AccountPool, load_accounts, sign_in

DATA_FILE = Path(__file__).parent / "data" / "employees.csv"
ACCOUNTS = AccountPool(
    load_accounts(os.environ.get("LOCUST_EMPLOYEE_ACCOUNTS", str(DATA_FILE)))
)

# What an employee might type into the partner search box.
SEARCH_TERMS = ["restaurant", "librairie", "sport", "café", "atelier", "bien-être"]


class EmployeeUser(HttpUser):
    """One signed-in salarié: checks the wallet often, browses often, pays sometimes."""

    wait_time = between(2, 6)

    def on_start(self):
        account = ACCOUNTS.next()
        if not sign_in(
            self.client,
            account["email"],
            account["password"],
            "POST /auth/sign-in/email [employee]",
        ):
            raise StopUser()

    @task(5)
    def view_wallet(self):
        self.client.get(f"{API_PREFIX}/me/wallet", name=f"{API_PREFIX}/me/wallet")

    @task(4)
    def view_wallet_history(self):
        self.client.get(
            f"{API_PREFIX}/me/wallet/entries",
            params={"limit": 20},
            name=f"{API_PREFIX}/me/wallet/entries",
        )

    @task(2)
    def browse_categories(self):
        self.client.get(
            f"{API_PREFIX}/partners/categories",
            name=f"{API_PREFIX}/partners/categories",
        )

    @task(5)
    def browse_partner_catalog(self):
        """Lists the catalogue, then opens one card — the two calls a real browse does."""
        params = {"limit": 20}
        if random.random() < 0.4:
            params["search"] = random.choice(SEARCH_TERMS)

        with self.client.get(
            f"{API_PREFIX}/partners",
            params=params,
            name=f"{API_PREFIX}/partners",
            catch_response=True,
        ) as response:
            if response.status_code != 200:
                response.failure(f"unexpected status {response.status_code}")
                return
            response.success()
            items = response.json().get("items", [])

        if items:
            partner_id = random.choice(items)["id"]
            self.client.get(
                f"{API_PREFIX}/partners/{partner_id}",
                name=f"{API_PREFIX}/partners/[id]",
            )

    @task(2)
    def start_a_payment(self):
        """Opens the pay screen (issues a token, reads it back), then half the
        time backs out and cancels it — the two realistic endings of that flow.
        """
        with self.client.post(
            f"{API_PREFIX}/me/payment-tokens",
            name=f"{API_PREFIX}/me/payment-tokens [issue]",
            catch_response=True,
        ) as response:
            if response.status_code != 201:
                response.failure(f"unexpected status {response.status_code}")
                return
            response.success()

        self.client.get(
            f"{API_PREFIX}/me/payment-tokens/current",
            name=f"{API_PREFIX}/me/payment-tokens/current",
        )

        if random.random() < 0.5:
            self.client.delete(
                f"{API_PREFIX}/me/payment-tokens/current",
                name=f"{API_PREFIX}/me/payment-tokens/current [revoke]",
            )
