import { NextResponse } from "next/server";
import { prisma } from "@/prisma/config";
import { ItemCategory } from "@/prisma/config";

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function POST(
    request: Request,
    context: RouteContext
) {
    try {
        const { id } = await context.params;

        const body = await request.json();

        const {
            batchNumber,
            quantity,
            expiryDate,
            buyPrice,
            sellPrice,
        } = body;

        if (!batchNumber || quantity === undefined || !expiryDate || buyPrice === undefined || sellPrice === undefined) {
            return NextResponse.json(
                {
                    message: "Nomor batch, jumlah stok, tanggal kedaluwarsa, harga beli, dan harga jual wajib diisi.",
                },
                { status: 400 }
            );
        }

        const item = await prisma.item.findFirst({
            where: {
                id,
                category: ItemCategory.OBAT_OTC,
                isActive: true,
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

        if (Number(quantity) <= 0) {
            return NextResponse.json(
                {
                    message: "Jumlah stok harus lebih dari 0.",
                },
                { status: 400 }
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

        const existingBatch = await prisma.batch.findFirst({
            where: {
                itemId: id,
                batchNumber: batchNumber.trim(),
            },
        });

        if (existingBatch) {
            return NextResponse.json(
                {
                    message:
                        "Nomor batch tersebut sudah digunakan untuk obat ini.",
                },
                { status: 409 }
            );
        }

        const batch = await prisma.batch.create({
            data: {
                itemId: id,
                batchNumber: batchNumber.trim().toUpperCase(),
                quantity: Number(quantity),
                initialQuantity: Number(quantity),
                expiryDate: new Date(expiryDate),
                buyPrice: Number(buyPrice),
                sellPrice: Number(sellPrice),
            },
        });

        return NextResponse.json(
            {
                message: "Batch berhasil ditambahkan.",
                batch,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("CREATE OTC BATCH ERROR:", error);

        return NextResponse.json(
            {
                message: "Terjadi kesalahan saat menambahkan batch.",
            },
            { status: 500 }
        );
    }
}