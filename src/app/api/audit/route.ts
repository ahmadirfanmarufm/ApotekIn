import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  try {
    const audits = await prisma.stockAudit.findMany({
      include: {
        conductedBy: {
          select: { id: true, fullName: true },
        },
        _count: {
          select: { details: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: audits,
    });
  } catch (error) {
    console.error("GET Stock Audits Error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil daftar audit." },
      { status: 500 },
    );
  }
}
