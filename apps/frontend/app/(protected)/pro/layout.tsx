import { Suspense } from "react";

import { ROLES } from "@/lib/auth/constants";
import { RoleGate } from "@/lib/auth/role-gate";

export default function Layout({ children }: LayoutProps<"/pro">) {
  return (
    <Suspense
      fallback={<p className="px-6 py-12 text-sm">Chargement de la session…</p>}
    >
      <RoleGate role={ROLES.PARTNER}>{children}</RoleGate>
    </Suspense>
  );
}
