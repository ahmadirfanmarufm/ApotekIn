import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getUserPermissions } from "@/lib/permission";

import OutgoingStockSection from "@/components/inventory/OutgoingStockSection";

export default async function OutgoingPage() {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const permissions = await getUserPermissions(session.user.id, session.user.role);

  if (!permissions.includes("*") && !permissions.includes("stock_out.view")) {
    redirect("/not-permission");
  }

  return <OutgoingStockSection />;
}