import { redirect } from 'next/navigation';

import { EspacePlaceholder } from '@/components/composites/espace-placeholder';
import { getCurrentUser } from '@/lib/auth/session';
import { StartDsfrOnHydration } from '@/lib/dsfr';

export default async function Page() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <>
      <StartDsfrOnHydration />
      <EspacePlaceholder titre="Administration" user={user} />
    </>
  );
}
