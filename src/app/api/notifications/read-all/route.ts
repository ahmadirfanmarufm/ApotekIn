import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";

export const dynamic = "force-dynamic";

export async function PATCH(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  try {
    const result = await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      message: "Semua notifikasi ditandai telah dibaca.",
      data: { updatedCount: result.count },
    });
  } catch (error) {
    console.error("[NOTIFICATIONS/PATCH_READ_ALL]", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui notifikasi." },
      { status: 500 },
    );
  }
}
