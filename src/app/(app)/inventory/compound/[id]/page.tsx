import { notFound, redirect } from "next/navigation";

import { prisma } from "@/prisma/config";
import { ItemCategory } from "@/prisma/config";
import { auth } from "@/lib/auth";
import { getUserPermissions } from "@/lib/permission";

import { CompoundBatchDetail } from "@/components/inventory/CompoundBatchDetail";

interface CompoundBatchDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function CompoundBatchDetailPage({ params }: CompoundBatchDetailPageProps) {
    const session = await auth();

    if (!session?.user?.id || !session.user.role) {
        redirect("/login");
    }

    const permissions = await getUserPermissions(
        session.user.id,
        session.user.role,
    );

    if (!permissions.includes("*") && !permissions.includes("inventory.view")) {
        redirect("/not-permission");
    }

    const { id } = await params;

    const item = await prisma.item.findFirst({
        where: {
            id,
            category: ItemCategory.BAHAN_RACIKAN,
            isActive: true,
        },
        include: {
            batches: {
                orderBy: {
                    expiryDate: "asc",
                },
                include: {
                    stockOutItems: {
                        orderBy: {
                            createdAt: "desc",
                        },
                        include: {
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
                include: {
                    purchaseOrder: {
                        include: {
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
        description: item.description,

        batches: item.batches.map((batch) => ({
            id: batch.id,
            batchNumber: batch.batchNumber,
            quantity: batch.quantity,
            initialQuantity: batch.initialQuantity,
            expiryDate: batch.expiryDate.toISOString(),
            buyPrice: Number(batch.buyPrice),
            sellPrice: Number(batch.sellPrice),

            stockOutItems: batch.stockOutItems.map((transaction) => ({
                id: transaction.id,
                quantity: transaction.quantity,
                unitPrice: Number(transaction.unitPrice),
                createdAt: transaction.createdAt.toISOString(),

                stockOut: {
                    referenceNo: transaction.stockOut.referenceNo,
                    createdAt: transaction.stockOut.createdAt.toISOString(),
                },
            })),
        })),

        purchaseOrderItems: item.purchaseOrderItems.map((po) => ({
            id: po.id,
            batchNumber: po.batchNumber ?? "-",
            quantity: po.quantity,
            expiryDate: po.expiryDate
                ? po.expiryDate.toISOString()
                : "",
            unitPrice: Number(po.unitPrice),
            createdAt: po.createdAt.toISOString(),

            purchaseOrder: {
                id: po.purchaseOrder.id,
                poNumber: po.purchaseOrder.poNumber,
                status: po.purchaseOrder.status,
                receivedAt: po.purchaseOrder.receivedAt?.toISOString() ?? null,
                createdAt: po.purchaseOrder.createdAt.toISOString(),

                supplier: {
                    id: po.purchaseOrder.supplier.id,
                    name: po.purchaseOrder.supplier.name,
                    code: po.purchaseOrder.supplier.code,
                },
            },
        })),
    };

    return (
        <CompoundBatchDetail
            item={serializedItem}
        />
    );
}