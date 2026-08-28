import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_req: NextRequest, { params }: RouteProps) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  const userId = session.user.id;

  try {
    const { id: notificationId } = await params;

    if (!notificationId || typeof notificationId !== "string") {
      return NextResponse.json(
        { success: false, message: "ID notifikasi tidak valid." },
        { status: 400 },
      );
    }

    const existing = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
      select: { id: true, isRead: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Notifikasi tidak ditemukan." },
        { status: 404 },
      );
    }

    if (existing.isRead) {
      return NextResponse.json(
        {
          success: true,
          message: "Notifikasi sudah ditandai dibaca.",
          data: { id: existing.id, isRead: true },
        },
        { status: 200 },
      );
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
      select: { id: true, isRead: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Notifikasi ditandai telah dibaca.",
        data: {
          id: updated.id,
          isRead: updated.isRead,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[NOTIFICATIONS/PATCH_READ]", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui status notifikasi.",
      },
      { status: 500 },
    );
  }
}
