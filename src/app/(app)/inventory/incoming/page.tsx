import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getUserPermissions } from "@/lib/permission";

import IncomingStockClient from "@/components/inventory/IncomingStockClient";

export default async function IncomingPage() {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const permissions = await getUserPermissions(session.user.id, session.user.role);

  if (!permissions.includes("*") && !permissions.includes("stock_in.view")) {
    redirect("/not-permission");
  }

  return <IncomingStockClient />;
}