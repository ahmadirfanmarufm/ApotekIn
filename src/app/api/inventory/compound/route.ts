import { NextResponse } from "next/server";
import { prisma } from "@/prisma/config";
import { ItemCategory } from "@/prisma/config";

async function generateCompoundCode() {
    const items = await prisma.item.findMany({
        where: {
            code: {
                startsWith: "BHN-RAC-",
            },
        },
        select: {
            code: true,
        },
    });

    let maxNumber = 0;

    for (const item of items) {
        const match = item.code.match(/^BHN-RAC-(\d+)$/);

        if (match) {
            const number = Number(match[1]);

            if (number > maxNumber) {
                maxNumber = number;
            }
        }
    }

    const nextNumber = maxNumber + 1;

    return `BHN-RAC-${String(nextNumber).padStart(3, "0")}`;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            name,
            unit,
            minStock,
            maxStock,
            description,
            batch,
        } = body;

        if (!name || !unit) {
            return NextResponse.json(
                {
                    message: "Nama dan satuan bahan wajib diisi.",
                },
                { status: 400 }
            );
        }

        if (Number(minStock) < 0 || Number(maxStock) < 0) {
            return NextResponse.json(
                {
                    message: "Stok minimum dan maksimum tidak boleh negatif.",
                },
                { status: 400 }
            );
        }

        if (Number(maxStock) <= Number(minStock)) {
            return NextResponse.json(
                {
                    message: "Stok maksimum harus lebih besar dari stok minimum.",
                },
                { status: 400 }
            );
        }

        if (!batch) {
            return NextResponse.json(
                {
                    message: "Batch awal wajib diisi.",
                },
                { status: 400 }
            );
        }

        const {
            batchNumber,
            quantity,
            expiryDate,
            buyPrice,
            sellPrice,
        } = batch;

        if (!batchNumber || quantity === undefined || !expiryDate || buyPrice === undefined || sellPrice === undefined) {
            return NextResponse.json(
                {
                    message: "Nomor batch, jumlah stok, tanggal kedaluwarsa, harga beli, dan harga jual wajib diisi.",
                },
                { status: 400 }
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

        const parsedExpiryDate = new Date(expiryDate);

        if (Number.isNaN(parsedExpiryDate.getTime())) {
            return NextResponse.json(
                {
                    message:
                        "Tanggal kedaluwarsa tidak valid.",
                },
                { status: 400 }
            );
        }

        const normalizedBatchNumber = batchNumber.trim().toUpperCase();

        const existingBatch = await prisma.batch.findFirst({
                where: {
                    batchNumber:
                        normalizedBatchNumber,
                },
            });

        if (existingBatch) {
            return NextResponse.json(
                {
                    message:
                        "Nomor batch tersebut sudah digunakan.",
                },
                { status: 409 }
            );
        }

        const code = await generateCompoundCode();

        const item = await prisma.item.create({
                data: {
                    name: name.trim(),
                    code,
                    category: ItemCategory.BAHAN_RACIKAN,
                    unit: unit.trim(),
                    minStock: Number(minStock),
                    maxStock: Number(maxStock),
                    description: description?.trim() || null,
                    batches: {
                        create: {
                            batchNumber: normalizedBatchNumber,
                            quantity: Number(quantity),
                            initialQuantity: Number(quantity),
                            expiryDate: parsedExpiryDate,
                            buyPrice: Number(buyPrice),
                            sellPrice: Number(sellPrice),
                        },
                    },
                },

                include: {
                    batches: true,
                },
            });

        return NextResponse.json(
            {
                message: "Bahan racikan berhasil ditambahkan.",
                item,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(
            "CREATE COMPOUND ERROR:",
            error
        );

        return NextResponse.json(
            {
                message: "Terjadi kesalahan saat menambahkan bahan racikan.",
            },
            { status: 500 }
        );
    }
}