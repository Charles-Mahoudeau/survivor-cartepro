import { Suspense } from 'react';

import { BandeauSimulation } from '@/components/composites/simulation-banner';
import { ROLES } from '@/lib/auth/constants';
import { RoleGate } from '@/lib/auth/role-gate';

/**
 * The employee shell. Header, notice and grid are static and paint at once.
 * The role gate reads the session behind its own boundary, beside the page
 * rather than around it: the page streams its own skeletons meanwhile, and
 * the gate redirects a wrong role as soon as the session resolves. The API
 * enforces the role on every read regardless.
 */
export default function Layout({ children, header }: LayoutProps<'/me'>) {
  return (
    <>
      {header}
      <BandeauSimulation />
      <main id="contenu" className="fr-container fr-py-4w flex-1 md:fr-py-6w">
        <div className="fr-grid-row fr-grid-row--center">
          <div className="fr-col-12 fr-col-md-10 fr-col-lg-8">
            <Suspense fallback={null}>
              <RoleGate role={ROLES.EMPLOYEE} />
            </Suspense>
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
