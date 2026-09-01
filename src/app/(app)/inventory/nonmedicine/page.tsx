import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserPermissions } from "@/lib/permission";
import NonMedicineClient from "@/components/inventory/NonMedicineClient";

export default async function NonMedicineInventoryPage() {
    const session = await auth();
    
    if (!session?.user?.id || !session.user.role) {
        redirect("/login");
    }

    const permissions = await getUserPermissions(session.user.id, session.user.role);

    if (!permissions.includes("*") && !permissions.includes("inventory.view")) {
        redirect("/not-permission");
    }

    return (
        <NonMedicineClient/>
    );
}