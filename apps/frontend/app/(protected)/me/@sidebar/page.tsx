import { Suspense } from 'react';

import { EmployeeSidebar } from '@/components/composites/sidebar/employee.client';
import { SidebarUser } from '@/components/composites/sidebar/user';

/**
 * Static: only the account entry reads the session, behind its own boundary,
 * so the navigation paints with the shell instead of waiting for it.
 */
export default function Page() {
  return (
    <EmployeeSidebar
      account={
        <Suspense fallback={null}>
          <SidebarUser />
        </Suspense>
      }
    />
  );
}
