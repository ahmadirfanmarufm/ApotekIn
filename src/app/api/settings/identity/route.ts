import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import { IdentitySchema } from "@/lib/validations/settings";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid atau telah berakhir." },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const validatedFields = IdentitySchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal. Periksa kembali input Anda.",
          errors: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { fullName, email, phone, noSIPA } = validatedFields.data;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { fullName, email, phone, noSIPA },
    });

    return NextResponse.json({
      success: true,
      message: "Identitas berhasil diperbarui!",
    });
  } catch (error) {
    console.error("Update Identity API Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui identitas." },
      { status: 500 },
    );
  }
}
