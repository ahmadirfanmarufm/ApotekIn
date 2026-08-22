import { NextResponse } from "next/server";
import { prisma } from "@/prisma/config";
import { ItemCategory } from "@/prisma/config";

async function generateOtcCode() {
    const items = await prisma.item.findMany({
        where: {
            code: {
                startsWith: "OBT-OTC-",
            },
        },
        select: {
            code: true,
        },
    });

    let maxNumber = 0;

    for (const item of items) {
        const match = item.code.match(/^OBT-OTC-(\d+)$/);

        if (match) {
            const number = Number(match[1]);

            if (number > maxNumber) {
                maxNumber = number;
            }
        }
    }

    const nextNumber = maxNumber + 1;

    return `OBT-OTC-${String(nextNumber).padStart(3, "0")}`;
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
            imageUrl,
            batch,
        } = body;

        if (!name?.trim() || !unit?.trim()) {
            return NextResponse.json(
                {
                    message: "Nama dan satuan obat wajib diisi.",
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


        if (batch) {
            if (!batch.batchNumber?.trim()) {
                return NextResponse.json(
                    {
                        message: "Nomor batch wajib diisi.",
                    },
                    { status: 400 }
                );
            }

            if (Number(batch.quantity) <= 0) {
                return NextResponse.json(
                    {
                        message: "Jumlah stok batch harus lebih dari 0.",
                    },
                    { status: 400 }
                );
            }

            if (!batch.expiryDate) {
                return NextResponse.json(
                    {
                        message: "Tanggal kedaluwarsa batch wajib diisi.",
                    },
                    { status: 400 }
                );
            }

            if (Number(batch.buyPrice) < 0) {
                return NextResponse.json(
                    {
                        message: "Harga beli tidak boleh negatif.",
                    },
                    { status: 400 }
                );
            }

            if (Number(batch.sellPrice) < 0) {
                return NextResponse.json(
                    {
                        message: "Harga jual tidak boleh negatif.",
                    },
                    { status: 400 }
                );
            }

            if (Number(batch.sellPrice) < Number(batch.buyPrice)) {
                return NextResponse.json(
                    {
                        message: "Harga jual tidak boleh lebih kecil dari harga beli.",
                    },
                    { status: 400 }
                );
            }
        }

        const code = await generateOtcCode();

        const item = await prisma.item.create({
            data: {
                name: name.trim(),
                code,
                category: ItemCategory.OBAT_OTC,
                unit: unit.trim(),
                minStock: Number(minStock),
                maxStock: Number(maxStock),
                description: description?.trim() || null,
                imageUrl: imageUrl?.trim() || null,

                ...(batch && {
                    batches: {
                        create: {
                            batchNumber: batch.batchNumber.trim(),
                            quantity: Number(batch.quantity),
                            initialQuantity: Number(batch.quantity),
                            expiryDate: new Date(batch.expiryDate),
                            buyPrice: Number(batch.buyPrice),
                            sellPrice: Number(batch.sellPrice),
                        },
                    },
                }),
            },

            include: {
                batches: true,
            },
        });

        return NextResponse.json(
            {
                message: "Obat OTC berhasil ditambahkan.",
                item,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("CREATE OTC ERROR:", error);

        return NextResponse.json(
            {
                message: "Terjadi kesalahan saat menambahkan obat.",
            },
            { status: 500 }
        );
    }
}