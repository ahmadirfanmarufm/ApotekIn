import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();

    const batches = await prisma.batch.findMany({
      where: {
        quantity: {
          gt: 0,
        },
        item: {
          isActive: true,
          ...(search && {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { code: { contains: search, mode: "insensitive" } },
            ],
          }),
        },
      },
      select: {
        id: true,
        batchNumber: true,
        quantity: true,
        expiryDate: true,
        sellPrice: true,
        itemId: true,
        item: {
          select: {
            id: true,
            code: true,
            name: true,
            unit: true,
            category: true,
          },
        },
      },
      orderBy: [{ expiryDate: "asc" }, { batchNumber: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: batches,
    });
  } catch (error) {
    console.error("GET Available Batches Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data batch tersedia." },
      { status: 500 },
    );
  }
}
