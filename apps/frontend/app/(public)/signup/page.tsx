import type { Metadata } from "next";

import { AuthShell } from "@/components/composites/auth-shell";
import { SignUpForm } from "./signup-form.client";

export const metadata: Metadata = {
  title: "Créer un compte — Ticket Tout (simulation)",
};

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
