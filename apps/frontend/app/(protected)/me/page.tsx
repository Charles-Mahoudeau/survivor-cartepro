import { redirect } from 'next/navigation';

import { MockApp } from '@/components/mock/mock-app';
import { getCurrentUser } from '@/lib/auth/session';

export default async function Page() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <MockApp role="employee" userName={user.name} />;
}
