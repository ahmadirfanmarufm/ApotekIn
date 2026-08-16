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
        } = body;

        if (!name || !unit) {
            return NextResponse.json(
                {
                    message:
                        "Nama, kode, dan satuan obat wajib diisi.",
                },
                { status: 400 }
            );
        }

        if (Number(maxStock) <= Number(minStock)) {
            return NextResponse.json(
                {
                    message:
                        "Stok maksimum harus lebih besar dari stok minimum.",
                },
                { status: 400 }
            );
        }

        /*
         * Sementara menggunakan branch utama.
         * Nantinya branchId sebaiknya diambil dari session user.
         */
        const branch = await prisma.branch.findFirst({
            where: {
                isPrimary: true,
            },
        });

        if (!branch) {
            return NextResponse.json(
                {
                    message:
                        "Branch utama belum tersedia.",
                },
                { status: 404 }
            );
        }

        const code = await generateOtcCode();

        const item = await prisma.item.create({
            data: {
                name: name.trim(),
                code: code,
                category: ItemCategory.OBAT_OTC,
                unit,
                minStock: Number(minStock),
                maxStock: Number(maxStock),
                description: description?.trim() || null,
                imageUrl: imageUrl || null,
                branchId: branch.id,
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
                message:
                    "Terjadi kesalahan saat menambahkan obat.",
            },
            { status: 500 }
        );
    }
}