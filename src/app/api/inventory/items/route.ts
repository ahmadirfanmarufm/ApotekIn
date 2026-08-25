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

    const items = await prisma.item.findMany({
      where: {
        isActive: true,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        code: true,
        name: true,
        category: true,
        unit: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("GET Items Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data barang." },
      { status: 500 },
    );
  }
}
