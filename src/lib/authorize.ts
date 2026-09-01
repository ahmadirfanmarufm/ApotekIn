import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";

import {
  getUserPermissions,
  hasPermission,
} from "@/lib/permission";

export async function requirePermission(
  requiredPermission: string,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      authorized: false as const,

      response: NextResponse.json(
        {
          success: false,
          message: "Sesi tidak valid.",
        },
        {
          status: 401,
        },
      ),
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },

    select: {
      id: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    return {
      authorized: false as const,

      response: NextResponse.json(
        {
          success: false,
          message: "Akun tidak ditemukan atau sudah tidak aktif.",
        },
        {
          status: 403,
        },
      ),
    };
  }

  const permissions = await getUserPermissions(user.id, user.role);

  const allowed = hasPermission(permissions, requiredPermission);

  if (!allowed) {
    return {
      authorized: false as const,

      response: NextResponse.json(
        {
          success: false,
          message: "Kamu tidak memiliki permission untuk melakukan aksi ini.",
          requiredPermission,
        },
        {
          status: 403,
        },
      ),
    };
  }

  return {
    authorized: true as const,
    session,
    user,
    permissions,
  };
}