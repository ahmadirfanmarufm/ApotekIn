import { prisma } from "@/prisma/config";
import { ItemCategory } from "@/prisma/config";
import { OtcInventoryClient } from "@/components/inventory/OtcInventoryClient";
import type { OtcInventoryItem } from "@/types/inventory";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserPermissions } from "@/lib/permission";

export default async function OtcInventoryPage() {
    const session = await auth();
    
    if (!session?.user?.id || !session.user.role) {
        redirect("/login");
    }

    const permissions = await getUserPermissions(session.user.id, session.user.role);

    if (!permissions.includes("*") && !permissions.includes("inventory.view")) {
        redirect("/not-permission");
    }

    const items = await prisma.item.findMany({
        where: {
            category: ItemCategory.OBAT_OTC,
            isActive: true,
        },
        include: {
            batches: {
                orderBy: {
                    expiryDate: "asc",
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const serializedItems: OtcInventoryItem[] = items.map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        unit: item.unit,
        minStock: item.minStock,
        maxStock: item.maxStock,
        imageUrl: item.imageUrl,
        description: item.description,

        batches: item.batches.map((batch) => ({
            id: batch.id,
            batchNumber: batch.batchNumber,
            quantity: batch.quantity,
            initialQuantity: batch.initialQuantity,
            expiryDate: batch.expiryDate.toISOString(),
            buyPrice: batch.buyPrice.toString(),
            sellPrice: batch.sellPrice.toString(),
        })),
    }));

    return (
        <OtcInventoryClient
            items={serializedItems}
        />
    );
}