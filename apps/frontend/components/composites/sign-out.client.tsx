"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth/client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    // The session row is deleted server-side, but the router cache still holds
    // the authenticated pages: without refresh() the back button repaints them.
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="shrink-0 rounded border border-[color:var(--border)] px-3 py-1.5 font-display text-xs font-medium text-[color:var(--muted-foreground)] transition-colors hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] disabled:opacity-50"
    >
      {pending ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
