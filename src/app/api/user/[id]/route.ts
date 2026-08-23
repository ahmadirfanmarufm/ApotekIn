import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import bcrypt from "bcryptjs";
import { UpdateUserSchema } from "@/lib/validations/user-management";
import { Role } from "@/prisma/config";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: RouteProps) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 }
    );
  }

  try {
    const { id: userId } = await params;
    const body = await req.json();

    const validatedFields = UpdateUserSchema.safeParse(body);
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

    const { fullName, email, noSIPA, phone, role, password } = validatedFields.data;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "Karyawan tidak ditemukan." },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      fullName,
      email,
      noSIPA: noSIPA || null,
      phone: phone || null,
      role: role as Role,
    };

    if (password && password.trim() !== "") {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data karyawan berhasil diperbarui.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("PATCH Employee Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui data karyawan." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteProps) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 }
    );
  }

  try {
    const { id: userId } = await params;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "Karyawan tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: "Karyawan berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE Employee Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus karyawan." },
      { status: 500 }
    );
  }
}