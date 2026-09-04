"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { authClient } from "@/lib/auth/client";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";
import {
  AUTH_ERROR_MESSAGES,
  toAuthError,
  type AuthErrorCode,
} from "@/lib/auth/errors";
import { roleHome } from "@/lib/auth/guard";

export function SignUpForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [failure, setFailure] = useState<AuthErrorCode | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(formData: FormData) {
    setFailure(null);
    setSubmitting(true);

    // The role is never sent: the API assigns it from its own default, so a
    // crafted request cannot ask for the administration space.
    const { data, error } = await authClient.signUp.email({
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    if (error || !data) {
      setFailure(toAuthError(error));
      setSubmitting(false);
      return;
    }

    // Sign-up opens the session itself, so there is nothing to sign in to.
    startTransition(() => {
      router.replace(roleHome(data.user.role));
      router.refresh();
    });
  }

  const busy = submitting || pending;

  return (
    <form action={submit} className="flex flex-col gap-4">
      {failure ? (
        <p
          role="alert"
          className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {AUTH_ERROR_MESSAGES[failure]}
        </p>
      ) : null}

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Nom et prénom</span>
        <input
          name="name"
          type="text"
          autoComplete="name"
          required
          className="border border-input bg-background px-3 py-2 text-base"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Adresse électronique</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="border border-input bg-background px-3 py-2 text-base"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Mot de passe</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          aria-describedby="password-rule"
          className="border border-input bg-background px-3 py-2 text-base"
        />
        <span id="password-rule" className="text-muted-foreground">
          {MIN_PASSWORD_LENGTH} caractères minimum.
        </span>
      </label>

      <button
        type="submit"
        disabled={busy}
        className="border border-primary px-4 py-2 text-sm font-medium text-primary disabled:opacity-60"
      >
        {busy ? "Création…" : "Créer mon compte"}
      </button>
    </form>
  );
}
