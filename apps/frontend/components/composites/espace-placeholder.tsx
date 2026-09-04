import type { CurrentUser } from "@/lib/auth/session";
import { SignOutButton } from "./sign-out.client";

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
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">{titre}</h1>
        <SignOutButton />
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border border-input p-4 text-sm">
        <dt className="font-medium">Compte</dt>
        <dd>{user.name}</dd>
        <dt className="font-medium">Adresse</dt>
        <dd>{user.email}</dd>
        <dt className="font-medium">Rôle</dt>
        <dd>{user.role}</dd>
      </dl>

      <p className="text-sm text-muted-foreground">
        Dispositif de simulation, sans valeur monétaire réelle.
      </p>
    </main>
  );
}
