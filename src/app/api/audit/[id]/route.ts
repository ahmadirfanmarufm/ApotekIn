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

    const audit = await prisma.stockAudit.findUnique({
      where: { id },
      include: {
        conductedBy: {
          select: { id: true, fullName: true, role: true },
        },
        details: {
          include: {
            item: {
              select: {
                id: true,
                code: true,
                name: true,
                unit: true,
              },
            },
            batch: {
              select: {
                id: true,
                batchNumber: true,
                expiryDate: true,
                sellPrice: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!audit) {
      return NextResponse.json(
        { success: false, message: "Audit tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: audit,
    });
  } catch (error) {
    console.error("GET Audit Detail Error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil detail audit." },
      { status: 500 },
    );
  }
}
