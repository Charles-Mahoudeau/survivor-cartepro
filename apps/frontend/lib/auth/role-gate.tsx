import { redirect } from 'next/navigation';

import type { Role } from './constants';
import { roleHome } from './guard';
import { getCurrentUser } from './session';

/**
 * Redirects a missing session to sign-in and a wrong role to its own space.
 * Renders nothing: it sits beside the page, inside a Suspense boundary.
 */
export async function RoleGate({ role }: { role: Role }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== role) {
    redirect(roleHome(user.role));
  }

  return null;
}
