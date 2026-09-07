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
      <main
        id="contenu"
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:py-10"
      >
        <div className="mx-auto w-full max-w-3xl">
          <div>
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
