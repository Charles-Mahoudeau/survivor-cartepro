"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toast } from "sonner";

import {
  BoutonAuth,
  ChampAuth,
} from "@/components/composites/auth-field";
import { Card } from "@/components/composites/card";
import { authClient } from "@/lib/auth/client";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";
import { AUTH_ERROR_MESSAGES, toAuthError } from "@/lib/auth/errors";
import { roleHome } from "@/lib/auth/guard";

export function SignUpForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  // React resets the form once the action settles; only the password should go.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  async function submit(formData: FormData) {
    setSubmitting(true);

    // The role is never sent: the API assigns it from its own default, so a
    // crafted request cannot ask for the administration space.
    const { data, error } = await authClient.signUp.email({
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    if (error || !data) {
      toast.error(AUTH_ERROR_MESSAGES[toAuthError(error)]);
      setSubmitting(false);
      return;
    }

    // Sign-up opens the session itself, so there is nothing to sign in to.
    // A refusal from a previous attempt must not survive onto the space the
    // account just reached.
    toast.dismiss();

    startTransition(() => {
      router.replace(roleHome(data.user.role));
      router.refresh();
    });
  }

  const busy = submitting || pending;

  return (
    <>
      <form action={submit}>
        <Card className="mb-4 p-6">
          <div className="space-y-4">
            <ChampAuth
              label="Nom et prénom"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Marie Dupont"
              value={name}
              onChange={setName}
            />
            <ChampAuth
              label="Adresse e-mail"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.fr"
              value={email}
              onChange={setEmail}
            />
            <ChampAuth
              label="Mot de passe"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••••••"
              minLength={MIN_PASSWORD_LENGTH}
              aide={`${MIN_PASSWORD_LENGTH} caractères minimum.`}
            />

            <BoutonAuth disabled={busy}>
              {busy ? "Création…" : "Créer mon compte"}
            </BoutonAuth>
          </div>
        </Card>
      </form>

      <p className="text-center font-serif text-sm text-[color:var(--muted-foreground)]">
        Vous avez déjà un compte ?{" "}
        <Link
          href="/login"
          className="text-[color:var(--primary)] hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </>
  );
}
