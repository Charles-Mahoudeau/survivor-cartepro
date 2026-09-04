import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/composites/auth-shell";
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
    <AuthShell
      titre="Connexion à Ticket Tout"
      sousTitre="Accédez à votre espace personnel selon votre profil."
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
