import type { Metadata } from "next";

import { AuthShell } from "@/components/composites/auth-shell";
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
    <AuthShell
      titre="Créer un compte Ticket Tout"
      sousTitre="Votre espace salarié, pour dépenser vos avantages chez les partenaires."
    >
      <SignUpForm />
    </AuthShell>
  );
}
