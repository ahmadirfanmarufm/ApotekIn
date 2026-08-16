import { NextResponse } from "next/server";
import { prisma } from "@/prisma/config";
import { ItemCategory } from "@/prisma/config";

interface RouteContext {
    params: Promise<{
        id: string;
        batchId: string;
    }>;
}

export async function PUT(
    request: Request,
    context: RouteContext
) {
    try {
        const { id, batchId } = await context.params;

        const body = await request.json();

        const {
            batchNumber,
            expiryDate,
            buyPrice,
            sellPrice,
        } = body;

        if (
            !batchNumber ||
            !expiryDate ||
            buyPrice === undefined ||
            sellPrice === undefined
        ) {
            return NextResponse.json(
                {
                    message:
                        "Nomor batch, tanggal kedaluwarsa, harga beli, dan harga jual wajib diisi.",
                },
                { status: 400 }
            );
        }

        const item = await prisma.item.findFirst({
            where: {
                id,
                category: ItemCategory.OBAT_OTC,
            },
        });

        if (!item) {
            return NextResponse.json(
                {
                    message: "Obat OTC tidak ditemukan.",
                },
                { status: 404 }
            );
        }

        const batch = await prisma.batch.findFirst({
            where: {
                id: batchId,
                itemId: id,
            },
        });

        if (!batch) {
            return NextResponse.json(
                {
                    message: "Batch tidak ditemukan.",
                },
                { status: 404 }
            );
        }

        if (Number(buyPrice) < 0 || Number(sellPrice) < 0) {
            return NextResponse.json(
                {
                    message: "Harga tidak boleh negatif.",
                },
                { status: 400 }
            );
        }

        if (Number(sellPrice) < Number(buyPrice)) {
            return NextResponse.json(
                {
                    message:
                        "Harga jual tidak boleh lebih kecil dari harga beli.",
                },
                { status: 400 }
            );
        }

        const duplicateBatch =
            await prisma.batch.findFirst({
                where: {
                    itemId: id,
                    batchNumber: batchNumber
                        .trim()
                        .toUpperCase(),
                    NOT: {
                        id: batchId,
                    },
                },
            });

        if (duplicateBatch) {
            return NextResponse.json(
                {
                    message:
                        "Nomor batch sudah digunakan oleh batch lain.",
                },
                { status: 409 }
            );
        }

        /*
         * quantity DAN initialQuantity sengaja tidak disentuh.
         *
         * Perubahan stok harus melalui transaksi stok masuk/keluar.
         */
        const updatedBatch = await prisma.batch.update({
            where: {
                id: batchId,
            },
            data: {
                batchNumber: batchNumber
                    .trim()
                    .toUpperCase(),
                expiryDate: new Date(expiryDate),
                buyPrice: Number(buyPrice),
                sellPrice: Number(sellPrice),
            },
        });

        return NextResponse.json({
            message: "Batch berhasil diperbarui.",
            batch: updatedBatch,
        });
    } catch (error) {
        console.error("UPDATE OTC BATCH ERROR:", error);

        return NextResponse.json(
            {
                message:
                    "Terjadi kesalahan saat memperbarui batch.",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    context: RouteContext
) {
    try {
        const { id, batchId } = await context.params;

        const item = await prisma.item.findFirst({
            where: {
                id,
                category: ItemCategory.OBAT_OTC,
            },
        });

        if (!item) {
            return NextResponse.json(
                {
                    message: "Obat OTC tidak ditemukan.",
                },
                { status: 404 }
            );
        }

        const batch = await prisma.batch.findFirst({
            where: {
                id: batchId,
                itemId: id,
            },
            include: {
                stockOutItems: true,
            },
        });

        if (!batch) {
            return NextResponse.json(
                {
                    message: "Batch tidak ditemukan.",
                },
                { status: 404 }
            );
        }

        /*
         * Jangan izinkan batch yang sudah digunakan
         * dalam transaksi stock out dihapus.
         */
        if (batch.stockOutItems.length > 0) {
            return NextResponse.json(
                {
                    message:
                        "Batch tidak dapat dihapus karena sudah digunakan dalam transaksi stok keluar.",
                },
                { status: 409 }
            );
        }

        await prisma.batch.delete({
            where: {
                id: batchId,
            },
        });

        return NextResponse.json({
            message: "Batch berhasil dihapus.",
        });
    } catch (error) {
        console.error("DELETE OTC BATCH ERROR:", error);

        return NextResponse.json(
            {
                message:
                    "Terjadi kesalahan saat menghapus batch.",
            },
            { status: 500 }
        );
    }
}