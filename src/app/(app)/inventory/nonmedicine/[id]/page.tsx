import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma, ItemCategory } from "@/prisma/config";
import { NonMedicineBatchDetail } from "@/components/inventory/NonMedicineBatchDetail";

interface NonMedicineBatchDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function NonMedicineBatchDetailPage({ params }: NonMedicineBatchDetailPageProps) {
    const { id } = await params;

    const item = await prisma.item.findFirst({
        where: {
            id,
            category: ItemCategory.NON_OBAT,
            isActive: true,
        },
        select: {
            id: true,
            name: true,
            code: true,
            unit: true,
            minStock: true,
            maxStock: true,
            imageUrl: true,
            description: true,

            batches: {
                orderBy: {
                    expiryDate: "asc",
                },
                select: {
                    id: true,
                    batchNumber: true,
                    quantity: true,
                    initialQuantity: true,
                    expiryDate: true,
                    buyPrice: true,
                    sellPrice: true,

                    stockOutItems: {
                        orderBy: {
                            createdAt: "desc",
                        },
                        take: 5,
                        select: {
                            id: true,
                            quantity: true,
                            unitPrice: true,
                            createdAt: true,

                            stockOut: {
                                select: {
                                    referenceNo: true,
                                    createdAt: true,
                                },
                            },
                        },
                    },
                },
            },

            purchaseOrderItems: {
                orderBy: {
                    createdAt: "desc",
                },
                take: 10,
                select: {
                    id: true,
                    batchNumber: true,
                    quantity: true,
                    expiryDate: true,
                    unitPrice: true,
                    createdAt: true,

                    purchaseOrder: {
                        select: {
                            id: true,
                            poNumber: true,
                            status: true,
                            receivedAt: true,
                            createdAt: true,

                            supplier: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!item) {
        notFound();
    }

    const serializedItem = {
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

            buyPrice: Number(batch.buyPrice),
            sellPrice: Number(batch.sellPrice),

            stockOutItems: batch.stockOutItems.map((stockOutItem) => ({
                id: stockOutItem.id,
                quantity: stockOutItem.quantity,
                unitPrice: Number(stockOutItem.unitPrice),
                createdAt: stockOutItem.createdAt.toISOString(),

                stockOut: {
                    referenceNo: stockOutItem.stockOut.referenceNo,
                    createdAt:
                        stockOutItem.stockOut.createdAt.toISOString(),
                },
            })),
        })),

        purchaseOrderItems: item.purchaseOrderItems.map((poItem) => ({
            id: poItem.id,
            batchNumber: poItem.batchNumber,
            quantity: poItem.quantity,
            expiryDate: poItem.expiryDate.toISOString(),
            unitPrice: Number(poItem.unitPrice),
            createdAt: poItem.createdAt.toISOString(),

            purchaseOrder: {
                id: poItem.purchaseOrder.id,
                poNumber: poItem.purchaseOrder.poNumber,
                status: poItem.purchaseOrder.status,
                receivedAt:
                    poItem.purchaseOrder.receivedAt?.toISOString() ?? null,
                createdAt: poItem.purchaseOrder.createdAt.toISOString(),

                supplier: {
                    id: poItem.purchaseOrder.supplier.id,
                    name: poItem.purchaseOrder.supplier.name,
                    code: poItem.purchaseOrder.supplier.code,
                },
            },
        })),
    };

    return (
        <div className="space-y-6 pb-12 font-inter text-slate-800">
            <div className="flex items-center gap-2 text-sm text-slate-400">
                <Link
                    href="/inventory/nonmedicine"
                    className="transition hover:text-slate-700"
                >
                    Non Obat
                </Link>

                <span>/</span>

                <span className="font-medium text-slate-600">
                    Detail Batch
                </span>
            </div>

            <NonMedicineBatchDetail item={serializedItem} />
        </div>
    );
}