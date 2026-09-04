import { Suspense } from 'react';

import { BandeauSimulation } from '@/components/composites/simulation-banner';
import { ROLES } from '@/lib/auth/constants';
import { RoleGate } from '@/lib/auth/role-gate';

/**
 * The employee shell. `header` is a parallel route (`@header`) that reads the
 * session on its own; the page is gated by role. Both sit behind a boundary:
 * a session read outside one is a build error.
 */
export default function Layout({ children, header }: LayoutProps<'/me'>) {
  return (
    <>
      <Suspense fallback={null}>{header}</Suspense>
      <BandeauSimulation />
      <main id="contenu" className="fr-container fr-py-4w flex-1 md:fr-py-6w">
        <div className="fr-grid-row fr-grid-row--center">
          <div className="fr-col-12 fr-col-md-10 fr-col-lg-8">
            <Suspense
              fallback={
                <p className="fr-text--sm text-[color:var(--muted-foreground)]">
                  Chargement de la session…
                </p>
              }
            >
              <RoleGate role={ROLES.EMPLOYEE}>{children}</RoleGate>
            </Suspense>
          </div>
        </div>
      </main>
    </>
  );
}
