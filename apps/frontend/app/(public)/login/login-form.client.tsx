"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { authClient } from "@/lib/auth/client";
import {
  SIGN_IN_ERROR_MESSAGES,
  toSignInError,
  type SignInErrorCode,
} from "@/lib/auth/errors";
import { safeRedirect } from "@/lib/auth/guard";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [failure, setFailure] = useState<SignInErrorCode | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(formData: FormData) {
    setFailure(null);
    setDetail(null);
    setSubmitting(true);

    const { data, error } = await authClient.signIn.email({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    if (error || !data) {
      const code = toSignInError(error);
      setFailure(code);
      // The suspension sentence is written by the API, which alone knows why.
      setDetail(code === "BANNED_USER" ? (error?.message ?? null) : null);
      setSubmitting(false);
      return;
    }

    // refresh() drops the router cache, so the previous visitor's pages are not
    // repainted for the account that just signed in.
    startTransition(() => {
      router.replace(safeRedirect(searchParams.get("next"), data.user.role));
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
          {detail ?? SIGN_IN_ERROR_MESSAGES[failure]}
        </p>
      ) : null}

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
          autoComplete="current-password"
          required
          className="border border-input bg-background px-3 py-2 text-base"
        />
      </label>

      <button
        type="submit"
        disabled={busy}
        className="border border-primary px-4 py-2 text-sm font-medium text-primary disabled:opacity-60"
      >
        {busy ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
