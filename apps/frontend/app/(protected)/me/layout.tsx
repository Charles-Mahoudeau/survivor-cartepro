import { Suspense } from 'react';

import { SpaceShell } from '@/components/composites/space-shell';
import { ROLES } from '@/lib/auth/constants';
import { RoleGate } from '@/lib/auth/role-gate';

/**
 * Sidebar and breadcrumb are slots of this segment, so a reload of any page
 * below resolves them from here. The gate sits beside the page rather than
 * around it, so the page streams while the session resolves.
 */
export default function Layout({
  children,
  sidebar,
  breadcrumb,
}: LayoutProps<'/me'>) {
  return (
    <SpaceShell sidebar={sidebar} breadcrumb={breadcrumb}>
      <Suspense fallback={null}>
        <RoleGate role={ROLES.EMPLOYEE} />
      </Suspense>
      {children}
    </SpaceShell>
  );
}
