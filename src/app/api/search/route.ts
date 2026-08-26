import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import { ItemCategory } from "@/prisma/config";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || searchParams.get("query")?.trim() || "";

    if (!q) {
      return NextResponse.json({
        success: true,
        data: {
          otc: [],
          compound: [],
          nonmedicine: [],
          all: [],
        },
      });
    }

    const items = await prisma.item.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { code: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      include: {
        batches: {
          orderBy: { expiryDate: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedItems = items.map((item) => {
      let detailUrl = `/inventory/otc/${item.id}`;
      let categoryLabel = "Obat OTC";

      if (item.category === ItemCategory.BAHAN_RACIKAN) {
        detailUrl = `/inventory/compound/${item.id}`;
        categoryLabel = "Resep / Racikan";
      } else if (item.category === ItemCategory.NON_OBAT) {
        detailUrl = `/inventory/nonmedicine/${item.id}`;
        categoryLabel = "Non Obat";
      }

      const totalStock = item.batches.reduce((sum, b) => sum + b.quantity, 0);

      return {
        id: item.id,
        name: item.name,
        code: item.code,
        category: item.category,
        categoryLabel,
        unit: item.unit,
        description: item.description,
        imageUrl: item.imageUrl,
        minStock: item.minStock,
        maxStock: item.maxStock,
        totalStock,
        batchCount: item.batches.length,
        detailUrl,
      };
    });

    const otc = formattedItems.filter((i) => i.category === ItemCategory.OBAT_OTC);
    const compound = formattedItems.filter((i) => i.category === ItemCategory.BAHAN_RACIKAN);
    const nonmedicine = formattedItems.filter((i) => i.category === ItemCategory.NON_OBAT);

    return NextResponse.json({
      success: true,
      data: {
        otc,
        compound,
        nonmedicine,
        all: formattedItems,
      },
    });
  } catch (error) {
    console.error("GET Search Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal melakukan pencarian." },
      { status: 500 }
    );
  }
}
