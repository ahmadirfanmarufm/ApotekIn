import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getUserPermissions } from "@/lib/permission";

import SupplierPageClient from "@/components/supplier/SupplierPageClient";

export default async function SupplierPage() {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const permissions = await getUserPermissions(
    session.user.id,
    session.user.role
  );

  if (!permissions.includes("*") && !permissions.includes("supplier.view")) {
    redirect("/not-permission");
  }

  return <SupplierPageClient />;
}