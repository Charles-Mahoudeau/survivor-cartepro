import { BlocMarque } from "@/components/composites/brand-block";
import { Card } from "@/components/composites/card";
import { SignOutButton } from "@/components/composites/sign-out.client";
import { BandeauSimulation } from "@/components/composites/simulation-banner";
import type { CurrentUser } from "@/lib/auth/session";

/**
 * Placeholder for the screens of the frontend specification. It exists so the
 * session guard has something to guard, and so a sign-in can be seen to work.
 */
export function EspacePlaceholder({
  titre,
  user,
}: {
  titre: string;
  user: CurrentUser;
}) {
  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b border-[color:var(--border)] bg-[color:var(--card)] px-6 py-4">
        <BlocMarque compact />
        <SignOutButton />
      </header>
      <BandeauSimulation />

      <main className="mx-auto w-full max-w-[640px] flex-1 px-4 py-10">
        <h1 className="mb-2 font-display text-2xl font-semibold text-[color:var(--foreground)]">
          {titre}
        </h1>
        <p className="mb-6 font-serif text-sm text-[color:var(--muted-foreground)]">
          Session ouverte. Les écrans de cet espace restent à construire.
        </p>

        <Card className="p-6">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
            <dt className="font-display text-xs font-medium uppercase tracking-wider text-[color:var(--muted-foreground)]">
              Compte
            </dt>
            <dd className="font-serif text-sm">{user.name}</dd>
            <dt className="font-display text-xs font-medium uppercase tracking-wider text-[color:var(--muted-foreground)]">
              Adresse
            </dt>
            <dd className="font-mono-data text-sm">{user.email}</dd>
            <dt className="font-display text-xs font-medium uppercase tracking-wider text-[color:var(--muted-foreground)]">
              Rôle
            </dt>
            <dd className="font-serif text-sm">{user.role}</dd>
          </dl>
        </Card>
      </main>
    </>
  );
}
