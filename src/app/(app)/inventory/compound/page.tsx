import { prisma } from "@/prisma/config";
import { ItemCategory } from "@/prisma/config";

import { CompoundInventoryClient } from "@/components/inventory/CompoundInventoryClient";
import type { CompoundInventoryItem } from "@/components/inventory/CompoundInventoryCard";

export default async function CompoundInventoryPage() {
    const items = await prisma.item.findMany({
        where: {
            category: ItemCategory.BAHAN_RACIKAN,
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
            name: "asc",
        },
    });

    const serializedItems: CompoundInventoryItem[] =
        items.map((item) => ({
            id: item.id,
            name: item.name,
            code: item.code,
            unit: item.unit,
            minStock: item.minStock,
            maxStock: item.maxStock,
            description: item.description,

            batches: item.batches.map((batch) => ({
                id: batch.id,
                batchNumber: batch.batchNumber,
                quantity: batch.quantity,
                initialQuantity: batch.initialQuantity,
                expiryDate:
                    batch.expiryDate.toISOString(),
                buyPrice: batch.buyPrice.toString(),
                sellPrice: batch.sellPrice.toString(),
            })),
        }));

    return (
        <CompoundInventoryClient
            items={serializedItems}
        />
    );
}