import { HeaderQuickAccessItem } from '@codegouvfr/react-dsfr/Header';

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
      <HeaderQuickAccessItem
        quickAccessItem={{
          iconId: 'fr-icon-account-circle-line',
          text: user.name,
          linkProps: { href: home },
        }}
      />
      <SignOutQuickAccess />
    </>
  );
}
