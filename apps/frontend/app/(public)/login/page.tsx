import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "./login-form.client";

export const metadata: Metadata = {
  title: "Connexion — Ticket Tout (simulation)",
};

/**
 * No role selector: the space comes from the session, never from a field. A
 * selector would suggest one can choose where to land.
 */
export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-16">
      <h1 className="font-display text-2xl font-bold">Connexion</h1>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
