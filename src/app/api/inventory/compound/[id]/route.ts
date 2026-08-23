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

        const {
            name,
            unit,
            minStock,
            maxStock,
            description,
            isActive,
        } = await request.json();

        if(!name || !unit) {
            return NextResponse.json({ message: "Nama dan satuan bahan wajib diisi!" }, { status: 400 });
        }

        if(Number(minStock) < 0 || Number(maxStock) < 0) {
            return NextResponse.json({ message: "Stok minimum dan maksimum tidak boleh negatif!" }, { status: 400 });
        }

        if(Number(minStock) >= Number(maxStock)) {
            return NextResponse.json({ message: "Stok maksimum harus lebih besar dari stok minimum!" }, { status: 400 });
        }

        const item = await prisma.item.findFirst({
            where: {
                id,
                category: ItemCategory.BAHAN_RACIKAN,
            },
        });

        if(!item) {
            return NextResponse.json({ message: "Bahan racikan tidak ditemukan!" }, { status: 404 });
        }

        const updatedItem = await prisma.item.update({
            where: {
                id,
            },
            data: {
                name: name.trim(),
                unit: unit.trim(),
                minStock: Number(minStock),
                maxStock: Number(maxStock),
                description: description?.trim() || null,
                isActive: typeof isActive === "boolean" ? isActive : item.isActive,
            },
        });

        return NextResponse.json({ message: "Bahan racikan berhasil diperbarui!", item: updatedItem });
    } catch (err) {
        console.error("UPDATED COMPOUND ERROR: ", err);

        return NextResponse.json({ message: "Terjadi kesalahan saat memperbarui bahan racikan!" }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const item = await prisma.item.findFirst({
            where: {
                id,
                category: ItemCategory.BAHAN_RACIKAN,
            },
        });

        if(!item) {
            return NextResponse.json({ message: "Bahan racikan tidak ditemukan!" }, { status: 404 });
        }

        if(!item.isActive) {
            return NextResponse.json({ message: "Bahan racikan sudah tidak aktif!" }, { status: 404 });
        }

        const deletedItem = await prisma.item.update({
            where: {
                id,
            },
            data: {
                isActive: false,
            },
        });

        return NextResponse.json({ message: "Bahan racikan berhasil dihapus dari inventory aktif!", item: deletedItem });
    } catch(err) {
        console.error("DELETE COMPOUND ERROR:", err);

        return NextResponse.json({ message: "Terjadi kesalahan saat menghapus bahan racikan!" }, { status: 500 });
    }
}