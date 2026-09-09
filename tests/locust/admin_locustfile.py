"""Classic 'administration' journey: monitor employers/allocations/applications,
with occasional write operations.

Some tasks MUTATE data — creating an employer, creating and applying an
allocation (credits every active wallet of an employer), deciding a pending
partner application. Run this only against a disposable/local database; reset
the recette dataset with `bun run db:seed --reset` (from apps/backend). See
tests/locust/README.md.

Run:
    locust -f tests/locust/admin_locustfile.py --host http://localhost:3001
"""

import os
import random
import string
import uuid
from pathlib import Path

from locust import HttpUser, between, task
from locust.exception import StopUser

from common import API_PREFIX, AccountPool, load_accounts, sign_in

DATA_FILE = Path(__file__).parent / "data" / "admins.csv"
ACCOUNTS = AccountPool(
    load_accounts(os.environ.get("LOCUST_ADMIN_ACCOUNTS", str(DATA_FILE)))
)


def random_siren() -> str:
    """Nine digits: CreateEmployerDto checks the format only, not the Luhn checksum."""
    return "".join(random.choices(string.digits, k=9))


class AdminUser(HttpUser):
    """One signed-in administrator: mostly reviews queues, occasionally writes."""

    wait_time = between(3, 8)

    def on_start(self):
        account = ACCOUNTS.next()
        if not sign_in(
            self.client,
            account["email"],
            account["password"],
            "POST /auth/sign-in/email [admin]",
        ):
            raise StopUser()

    @task(5)
    def list_employers(self):
        self.client.get(
            f"{API_PREFIX}/employers",
            params={"limit": 20},
            name=f"{API_PREFIX}/employers",
        )

    @task(5)
    def list_allocations(self):
        self.client.get(
            f"{API_PREFIX}/allocations",
            params={"limit": 20},
            name=f"{API_PREFIX}/allocations",
        )

    @task(4)
    def review_pending_applications(self):
        """Opens the review queue, then one dossier from it — like a reviewer would."""
        with self.client.get(
            f"{API_PREFIX}/partners/applications",
            params={"status": "pending", "limit": 20},
            name=f"{API_PREFIX}/partners/applications",
            catch_response=True,
        ) as response:
            if response.status_code != 200:
                response.failure(f"unexpected status {response.status_code}")
                return
            response.success()
            items = response.json().get("items", [])

        if items:
            application_id = random.choice(items)["id"]
            self.client.get(
                f"{API_PREFIX}/partners/applications/{application_id}",
                name=f"{API_PREFIX}/partners/applications/[id]",
            )

    @task(3)
    def list_audit_log(self):
        self.client.get(
            f"{API_PREFIX}/admin/audit",
            params={"limit": 20},
            name=f"{API_PREFIX}/admin/audit",
        )

    @task(1)
    def export_audit_period(self):
        self.client.get(
            f"{API_PREFIX}/admin/audit/export",
            name=f"{API_PREFIX}/admin/audit/export",
        )

    @task(1)
    def export_transactions_csv(self):
        self.client.get(
            f"{API_PREFIX}/admin/transactions.csv",
            name=f"{API_PREFIX}/admin/transactions.csv",
        )

    @task(1)
    def create_employer(self):
        """Mutates data: registers a fresh employer on every call."""
        self.client.post(
            f"{API_PREFIX}/employers",
            json={
                "name": f"Entreprise Locust {uuid.uuid4().hex[:8]}",
                "siren": random_siren(),
            },
            name=f"{API_PREFIX}/employers [create]",
        )

    @task(1)
    def create_and_apply_allocation(self):
        """Mutates data: the real allocation workflow (create, then apply),
        which credits every active wallet of the chosen employer.
        """
        with self.client.get(
            f"{API_PREFIX}/employers",
            params={"limit": 20},
            name=f"{API_PREFIX}/employers",
            catch_response=True,
        ) as response:
            if response.status_code != 200:
                response.failure(f"unexpected status {response.status_code}")
                return
            response.success()
            employers = response.json().get("items", [])

        if not employers:
            return
        employer_id = random.choice(employers)["id"]

        with self.client.post(
            f"{API_PREFIX}/allocations",
            json={
                "employerId": employer_id,
                "label": f"Campagne locust {uuid.uuid4().hex[:8]}",
                "amount": round(random.uniform(10, 150), 2),
            },
            name=f"{API_PREFIX}/allocations [create]",
            catch_response=True,
        ) as response:
            if response.status_code != 201:
                response.failure(f"unexpected status {response.status_code}")
                return
            response.success()
            allocation_id = response.json()["id"]

        self.client.post(
            f"{API_PREFIX}/allocations/{allocation_id}/apply",
            name=f"{API_PREFIX}/allocations/[id]/apply",
        )

    @task(1)
    def decide_pending_application(self):
        """Mutates data: approves or refuses one pending partner application.

        The recette dataset seeds only a handful of pending applications, so
        once the queue is empty this becomes a no-op rather than a failure.
        """
        with self.client.get(
            f"{API_PREFIX}/partners/applications",
            params={"status": "pending", "limit": 5},
            name=f"{API_PREFIX}/partners/applications",
            catch_response=True,
        ) as response:
            if response.status_code != 200:
                response.failure(f"unexpected status {response.status_code}")
                return
            response.success()
            items = response.json().get("items", [])

        if not items:
            return
        application_id = random.choice(items)["id"]
        decision = random.choice(["approved", "refused"])

        self.client.post(
            f"{API_PREFIX}/partners/applications/{application_id}/decision",
            json={"decision": decision, "reason": "Locust load test decision"},
            name=f"{API_PREFIX}/partners/applications/[id]/decision",
        )
