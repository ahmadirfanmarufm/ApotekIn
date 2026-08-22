import { NextResponse } from "next/server";
import { prisma } from "@/prisma/config";
import { ItemCategory } from "@/prisma/config";

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function PUT(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;

        const body = await request.json();

        const {
            name,
            unit,
            minStock,
            maxStock,
            description,
            imageUrl,
            isActive,
        } = body;

        if (!name|| !unit) {
            return NextResponse.json(
                {
                    message: "Nama, kode, dan satuan obat wajib diisi.",
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

        const updatedItem = await prisma.item.update({
            where: {
                id,
            },
            data: {
                name: name.trim(),
                unit,
                minStock: Number(minStock),
                maxStock: Number(maxStock),
                description: description?.trim() || null,
                imageUrl: imageUrl || null,
                isActive:
                    typeof isActive === "boolean"
                        ? isActive
                        : item.isActive,
            },
        });

        return NextResponse.json({
            message: "Obat OTC berhasil diperbarui.",
            item: updatedItem,
        });
    } catch (error) {
        console.error("UPDATE OTC ERROR:", error);

        return NextResponse.json(
            {
                message:
                    "Terjadi kesalahan saat memperbarui obat.",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;

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

        if (!item.isActive) {
            return NextResponse.json(
                {
                    message: "Obat OTC sudah tidak aktif.",
                },
                { status: 400 }
            );
        }

        const deletedItem = await prisma.item.update({
            where: {
                id,
            },
            data: {
                isActive: false,
            },
        });

        return NextResponse.json({
            message: "Obat OTC berhasil dihapus dari inventory aktif.",
            item: deletedItem,
        });

    } catch (error) {
        console.error("DELETE OTC ERROR:", error);

        return NextResponse.json(
            {
                message: "Terjadi kesalahan saat menghapus obat OTC.",
            },
            { status: 500 }
        );
    }
}