import { Suspense } from 'react';

import { ROLES } from '@/lib/auth/constants';
import { PiedDePage } from '@/components/composites/pied-de-page';
import { RoleGate } from '@/lib/auth/role-gate';

/**
 * The employee shell. `sidebar` is a parallel route (`@sidebar`) that reads
 * the session on its own and streams independently of the page. Both sit
 * behind a boundary: a session read outside one is a build error.
 */
export default function Layout({ children, sidebar }: LayoutProps<'/me'>) {
  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      <Suspense fallback={null}>{sidebar}</Suspense>
      <main
        id="contenu"
        className="min-h-screen pb-[72px] pt-[56px] md:pb-0 md:pl-[240px] md:pt-0"
      >
        <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8">
          <Suspense
            fallback={
              <p className="font-serif text-sm text-[color:var(--muted-foreground)]">
                Chargement de la session…
              </p>
            }
          >
            <RoleGate role={ROLES.EMPLOYEE}>{children}</RoleGate>
          </Suspense>
        </div>
      </main>

      <div className="pb-[72px] md:pb-0 md:pl-[240px]">
        <PiedDePage />
      </div>
    </div>
  );
}
