import type { ReactNode } from "react";

import { BlocMarque } from "./brand-block";
import { BandeauSimulation } from "./simulation-banner";

export function AuthShell({
  titre,
  sousTitre,
  children,
}: {
  titre: string;
  sousTitre: string;
  children: ReactNode;
}) {
  return (
    <>
      <header className="border-b border-[color:var(--border)] bg-[color:var(--card)] px-6 py-5">
        <BlocMarque />
      </header>
      <BandeauSimulation />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h1 className="mb-2 font-display text-2xl font-semibold text-[color:var(--foreground)]">
              {titre}
            </h1>
            <p className="font-serif text-sm text-[color:var(--muted-foreground)]">
              {sousTitre}
            </p>
          </div>
          {children}
        </div>
      </main>
    </>
  );
}
