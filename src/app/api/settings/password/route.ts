import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import bcrypt from "bcryptjs";
import { PasswordSchema } from "@/lib/validations/settings";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid atau telah berakhir." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const validatedFields = PasswordSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal.",
          errors: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { passwordSekarang, passwordBaru } = validatedFields.data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(passwordSekarang, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Password saat ini salah.",
          errors: { passwordSekarang: ["Password saat ini tidak cocok."] },
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(passwordBaru, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Password berhasil diperbarui!",
    });
  } catch (error) {
    console.error("Update Password API Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengubah password." },
      { status: 500 }
    );
  }
}