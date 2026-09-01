import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import { Role } from "@/prisma/config";
import { ROLE_PERMISSIONS } from "@/lib/permissions";

export async function getUserPermissions(userId: string, role: Role): Promise<string[]> {
  const defaultPermissions = ROLE_PERMISSIONS[role] ?? [];

  // Administrator = super administrator
  if (defaultPermissions.includes("*")) {
    return ["*"];
  }

  const customPermissions = await prisma.userPermission.findMany({
    where: {
      userId,
    },
    include: {
      permission: true,
    },
  });

  const permissions = new Set(defaultPermissions);

  for (const item of customPermissions) {
    if (item.allowed) {
      permissions.add(item.permission.code);
    } else {
      permissions.delete(item.permission.code);
    }
  }

  return Array.from(permissions);
}

export function hasPermission(permissions: string[], requiredPermission: string): boolean {
  return (
    permissions.includes("*") ||
    permissions.includes(requiredPermission)
  );
}

export async function getCurrentUserPermissions() {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    return null;
  }

  return getUserPermissions(session.user.id, session.user.role as Role);
}

export async function checkPermission(requiredPermission: string): Promise<boolean> {
  const permissions = await getCurrentUserPermissions();

  if (!permissions) {
    return false;
  }

  return hasPermission(permissions, requiredPermission);
}