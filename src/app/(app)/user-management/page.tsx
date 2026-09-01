import { AuditClient } from "@/components/audit/AuditClient";
import UserManagementClient from "@/components/user-management/UserManagementClient";
import { auth } from "@/lib/auth";
import { getUserPermissions } from "@/lib/permission";
import { redirect } from "next/navigation";

export default async function UserManagementPage() {
  const session = await auth();
  
  if (!session?.user?.id || !session.user.role) {
      redirect("/login");
  }

  const permissions = await getUserPermissions(session.user.id, session.user.role);

  if (!permissions.includes("*")  && !permissions.includes("user_management.view")) {
      redirect("/not-permission");
  }

  return <UserManagementClient />;
}
