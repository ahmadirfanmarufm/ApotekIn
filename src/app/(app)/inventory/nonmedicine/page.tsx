import { prisma } from "@/prisma/config";
import { ItemCategory } from "@/prisma/config";
import type { NonMedicineInventoryItem } from "@/types/inventory";
import { NonMedicineInventoryClient } from "@/components/inventory/NonMedicineClient";

export default async function NonMedicineInventoryPage() {
    const items = await prisma.item.findMany({
        where: {
            category: ItemCategory.NON_OBAT,
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

    const serializedItems: NonMedicineInventoryItem[] = items.map((item) => ({
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
        <NonMedicineInventoryClient items={serializedItems}/>
    );
}