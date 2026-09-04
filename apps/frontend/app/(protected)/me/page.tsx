import { redirect } from "next/navigation";

import { EspacePlaceholder } from "@/components/composites/espace-placeholder";
import { getCurrentUser } from "@/lib/auth/session";

export default async function Page() {
  // Deduplicated with the layout's read by React cache: one query per request.
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <EspacePlaceholder titre="Mon portefeuille" user={user} />;
}
