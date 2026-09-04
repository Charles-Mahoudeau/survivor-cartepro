import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import type { Role } from "./constants";
import { roleHome } from "./guard";
import { getCurrentUser } from "./session";

/**
 * Wraps its children rather than sitting beside them: a sibling renders in
 * parallel with the check, so the space would paint before the role is known.
 *
 * It is navigation, not authorization. The API refuses every request whose
 * session or role does not fit, and each server action re-checks; this only
 * spares the user a screen they cannot use.
 */
export async function RoleGate({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== role) {
    redirect(roleHome(user.role));
  }

  return <>{children}</>;
}
