import type { Metadata } from "next";
import Link from "next/link";

import { SignUpForm } from "./signup-form.client";

export const metadata: Metadata = {
  title: "Créer un compte — Ticket Tout (simulation)",
};

/**
 * Employee sign-up. The account is created with the role the API assigns by
 * default; the partner and administration roles are granted out of band.
 */
export default function SignUpPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-16">
      <h1 className="font-display text-2xl font-bold">Créer un compte</h1>
      <SignUpForm />
      <p className="text-sm text-muted-foreground">
        Vous avez déjà un compte ?{" "}
        <Link href="/login" className="underline">
          Se connecter
        </Link>
      </p>
    </main>
  );
}
