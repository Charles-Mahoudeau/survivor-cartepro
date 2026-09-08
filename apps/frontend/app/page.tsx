import { redirect } from 'next/navigation';

import { roleHome } from '@/lib/auth/guard';
import { getCurrentUser } from '@/lib/auth/session';

/**
 * No public home: the root sends a visitor to sign-in and a member to its
 * space. Nothing renders, so blocking on the session costs no paint.
 */
export const instant = false;

export default async function Home() {
  const user = await getCurrentUser();

  redirect(user ? roleHome(user.role) : '/login');
}
