import { Suspense } from 'react';

import { ROLES } from '@/lib/auth/constants';
import { RoleGate } from '@/lib/auth/role-gate';

export default function Layout({ children }: LayoutProps<'/admin'>) {
  return (
    <>
      <Suspense fallback={null}>
        <RoleGate role={ROLES.ADMIN} />
      </Suspense>
      {children}
    </>
  );
}
