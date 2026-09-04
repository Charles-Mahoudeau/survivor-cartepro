"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { toast } from "sonner";

import {
  BoutonAuth,
  ChampAuth,
} from "@/components/composites/auth-field";
import { Card } from "@/components/composites/card";
import { authClient } from "@/lib/auth/client";
import { AUTH_ERROR_MESSAGES, toAuthError } from "@/lib/auth/errors";
import { safeRedirect } from "@/lib/auth/guard";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  // React resets the form once the action settles: without this the address has
  // to be typed again after every refusal.
  const [email, setEmail] = useState("");

  async function submit(formData: FormData) {
    setSubmitting(true);

    const { data, error } = await authClient.signIn.email({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    if (error || !data) {
      const code = toAuthError(error);
      // A suspension is announced with the sentence the API wrote: it alone
      // knows what it refuses.
      toast.error(
        code === "BANNED_USER"
          ? (error?.message ?? AUTH_ERROR_MESSAGES[code])
          : AUTH_ERROR_MESSAGES[code],
      );
      setSubmitting(false);
      return;
    }

    // refresh() drops the router cache, so the previous visitor's pages are not
    // repainted for the account that just signed in.
    // A refusal from a previous attempt must not survive onto the space the
    // account just reached.
    toast.dismiss();

    startTransition(() => {
      router.replace(safeRedirect(searchParams.get("next"), data.user.role));
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
              autoComplete="current-password"
              placeholder="••••••••••••"
            />

            <BoutonAuth disabled={busy}>
              {busy ? "Connexion…" : "Se connecter"}
            </BoutonAuth>
          </div>
        </Card>
      </form>

      <p className="text-center font-serif text-sm text-[color:var(--muted-foreground)]">
        Pas encore de compte ?{" "}
        <Link
          href="/signup"
          className="text-[color:var(--primary)] hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </>
  );
}
