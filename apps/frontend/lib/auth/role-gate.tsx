import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import type { Role } from "./constants";
import { roleHome } from "./guard";
import { getCurrentUser } from "./session";

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
