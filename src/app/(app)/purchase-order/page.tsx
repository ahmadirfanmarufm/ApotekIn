import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getUserPermissions } from "@/lib/permission";

import PurchaseOrderClient from "@/components/purchase-order/PurchaseOrderSection";

export default async function SupplierPage() {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const permissions = await getUserPermissions(session.user.id, session.user.role);

  if (!permissions.includes("*") && !permissions.includes("purchase_order.view")) {
    redirect("/not-permission");
  }

  return <PurchaseOrderClient />;
}