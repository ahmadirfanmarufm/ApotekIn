import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";

export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  try {
    const result = await prisma.notification.deleteMany({
      where: { userId: session.user.id, isRead: true },
    });

    return NextResponse.json({
      success: true,
      message: "Notifikasi yang sudah dibaca berhasil dihapus.",
      data: { deletedCount: result.count },
    });
  } catch (error) {
    console.error("[NOTIFICATIONS/DELETE_READ]", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus notifikasi." },
      { status: 500 },
    );
  }
}
