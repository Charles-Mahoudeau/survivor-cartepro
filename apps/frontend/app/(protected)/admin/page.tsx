import { redirect } from "next/navigation";

import { EspacePlaceholder } from "@/components/composites/espace-placeholder";
import { getCurrentUser } from "@/lib/auth/session";

export default async function Page() {

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <EspacePlaceholder titre="Administration" user={user} />;
}
