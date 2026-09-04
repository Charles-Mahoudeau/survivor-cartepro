import { redirect } from 'next/navigation';

import { roleHome } from '@/lib/auth/guard';
import { getCurrentUser } from '@/lib/auth/session';

export default async function Home() {
  const user = await getCurrentUser();
  redirect(user ? roleHome(user.role) : '/login');
}
