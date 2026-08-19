import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import { AvatarSchema } from "@/lib/validations/settings";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const validatedFields = AvatarSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { success: false, message: "URL foto profil tidak valid." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: validatedFields.data.avatarUrl },
    });

    return NextResponse.json({
      success: true,
      message: "Foto profil berhasil diperbarui!",
    });
  } catch (error) {
    console.error("Update Avatar URL API Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyelaraskan foto profil di database." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 }
    );
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: null },
    });

    return NextResponse.json({
      success: true,
      message: "Foto profil berhasil dihapus!",
    });
  } catch (error) {
    console.error("Remove Avatar API Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus foto profil." },
      { status: 500 }
    );
  }
}