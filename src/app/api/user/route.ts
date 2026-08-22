import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import bcrypt from "bcryptjs";
import { CreateUserSchema } from "@/lib/validations/user-management";
import { Role } from "@/prisma/config";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10"));
    const roleParam = searchParams.get("role") as Role | null;

    const skip = (page - 1) * limit;
    const where = roleParam && Object.values(Role).includes(roleParam) ? { role: roleParam } : {};

    const [users, filteredCount, totalUsers, apotekerCount, ttkCount, adminLogistikCount] =
      await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            fullName: true,
            email: true,
            noSIPA: true,
            phone: true,
            avatarUrl: true,
            role: true,
            lastLogin: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
        prisma.user.count(),
        prisma.user.count({ where: { role: Role.APOTEKER_PENANGGUNG_JAWAB } }),
        prisma.user.count({ where: { role: Role.TENAGA_TEKNIS_KEFARMASIAN } }),
        prisma.user.count({ where: { role: Role.ADMIN_LOGISTIK } }),
      ]);

    const totalPages = Math.ceil(filteredCount / limit);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        totalItems: filteredCount,
        totalPages,
      },
      stats: {
        total: totalUsers,
        apoteker: apotekerCount,
        ttk: ttkCount,
        adminLogistik: adminLogistikCount,
      },
    });
  } catch (error) {
    console.error("GET Employees Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data karyawan." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const validatedFields = CreateUserSchema.safeParse(body);

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
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email sudah terdaftar.",
          errors: { email: ["Email sudah digunakan oleh pengguna lain."] },
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        noSIPA: noSIPA || null,
        phone: phone || null,
        role: role as Role,
        passwordHash: hashedPassword,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Karyawan berhasil ditambahkan.",
        data: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Employee Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat data karyawan." },
      { status: 500 }
    );
  }
}