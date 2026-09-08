import { Suspense } from 'react';

import { SidebarUser } from '@/components/composites/sidebar/user';

import AdminSidebarClient from './page.client';

/**
 * Static: only the account entry reads the session, behind its own boundary,
 * so the navigation paints with the shell instead of waiting for it.
 */
export default function AdminSidebar() {
  return (
    <AdminSidebarClient
      account={
        <Suspense fallback={null}>
          <SidebarUser />
        </Suspense>
      }
    />
  );
}
