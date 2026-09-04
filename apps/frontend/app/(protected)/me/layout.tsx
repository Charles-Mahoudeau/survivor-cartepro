import { Suspense } from "react";

import { ROLES } from "@/lib/auth/constants";
import { RoleGate } from "@/lib/auth/role-gate";

export default function Layout({ children }: LayoutProps<"/me">) {
  return (
    <Suspense
      fallback={<p className="px-6 py-12 text-sm">Chargement de la session…</p>}
    >
      <RoleGate role={ROLES.EMPLOYEE}>{children}</RoleGate>
    </Suspense>
  );
}
