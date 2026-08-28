import { NextRequest, NextResponse } from "next/server";
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

  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, message: "ID notifikasi tidak valid." },
        { status: 400 },
      );
    }

    const existing = await prisma.notification.findUnique({
      where: { id },
      select: { id: true, userId: true, isRead: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Notifikasi tidak ditemukan." },
        { status: 404 },
      );
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda tidak memiliki akses ke notifikasi ini.",
        },
        { status: 403 },
      );
    }

    if (existing.isRead) {
      return NextResponse.json({
        success: true,
        message: "Notifikasi sudah ditandai dibaca.",
        data: { id, isRead: true },
      });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
      select: { id: true, isRead: true },
    });

    return NextResponse.json({
      success: true,
      message: "Notifikasi ditandai telah dibaca.",
      data: updated,
    });
  } catch (error) {
    console.error("[NOTIFICATIONS/PATCH_READ]", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui notifikasi." },
      { status: 500 },
    );
  }
}
