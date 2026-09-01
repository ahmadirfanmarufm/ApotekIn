import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getUserPermissions } from "@/lib/permission";

import CompoundInventoryClient from "@/components/inventory/CompoundInventoryClient";

export default async function CompoundInventoryPage() {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const permissions = await getUserPermissions(
    session.user.id,
    session.user.role,
  );

  if (
    !permissions.includes("*") &&
    !permissions.includes("inventory.view")
  ) {
    redirect("/not-permission");
  }

  return <CompoundInventoryClient />;
}