import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import { SupplierSchema } from "@/lib/validations/supplier";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const validatedFields = SupplierSchema.safeParse(body);
    if (!validatedFields.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal.",
          errors: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { code, name, phone, contactPerson, email, address } =
      validatedFields.data;

    const existingSupplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!existingSupplier) {
      return NextResponse.json(
        { success: false, message: "Supplier tidak ditemukan." },
        { status: 404 },
      );
    }

    if (code !== existingSupplier.code) {
      const codeTaken = await prisma.supplier.findUnique({
        where: { code },
      });

      if (codeTaken) {
        return NextResponse.json(
          {
            success: false,
            message: "Kode supplier sudah digunakan.",
            errors: { code: ["Kode supplier sudah digunakan."] },
          },
          { status: 400 },
        );
      }
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id },
      data: {
        code,
        name,
        phone,
        contactPerson: contactPerson || null,
        email: email || null,
        address: address || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data supplier berhasil diperbarui.",
      data: updatedSupplier,
    });
  } catch (error) {
    console.error("PATCH Supplier Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui data supplier." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;

    const existingSupplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!existingSupplier) {
      return NextResponse.json(
        { success: false, message: "Supplier tidak ditemukan." },
        { status: 404 },
      );
    }

    // Soft delete agar riwayat purchase order tetap utuh
    await prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Supplier berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE Supplier Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus supplier." },
      { status: 500 },
    );
  }
}
