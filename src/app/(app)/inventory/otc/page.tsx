import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserPermissions } from "@/lib/permission";
import OtcInventoryClient from "@/components/inventory/OtcInventoryClient";

export default async function OtcInventoryPage() {
    const session = await auth();
    
    if (!session?.user?.id || !session.user.role) {
        redirect("/login");
    }

    const permissions = await getUserPermissions(session.user.id, session.user.role);

    if (!permissions.includes("*") && !permissions.includes("inventory.view")) {
        redirect("/not-permission");
    }

    return (
        <OtcInventoryClient/>
    );
}