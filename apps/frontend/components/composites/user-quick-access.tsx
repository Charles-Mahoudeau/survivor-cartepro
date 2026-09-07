import { RiAccountCircleLine } from '@remixicon/react';

import { QuickAccessLink } from '@/components/composites/quick-access';
import { SignOutQuickAccess } from '@/components/composites/sign-out-quick-access.client';
import { getCurrentUser } from '@/lib/auth/session';

/** The session-dependent part of the header: account name and sign-out. */
export async function UserQuickAccess({ home }: { home: string }) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <>
      <QuickAccessLink href={home} icon={RiAccountCircleLine}>
        {user.name}
      </QuickAccessLink>
      <SignOutQuickAccess />
    </>
  );
}
