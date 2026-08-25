import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  try {
    const { id } = await context.params;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
        items: {
          include: {
            item: {
              select: {
                id: true,
                code: true,
                name: true,
                unit: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json(
        { success: false, message: "Purchase Order tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: purchaseOrder,
    });
  } catch (error) {
    console.error("GET Purchase Order Detail Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil detail purchase order." },
      { status: 500 },
    );
  }
}
