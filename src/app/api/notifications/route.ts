import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  prisma,
  NotificationType,
  NotificationPriority,
  AuditStatus,
} from "@/prisma/config";
import { nowPlusDays, toRelativeTime } from "@/lib/date";

export const dynamic = "force-dynamic";

const NOTIFICATION_LIMIT = 10;
const EXPIRY_WINDOW_DAYS = 30;

type SmartNotificationItem = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  actionUrl: string | null;
  actionLabel: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  timeAgo: string;
};

type SmartNotificationPayload = {
  success: true;
  data: {
    notifications: SmartNotificationItem[];
    unreadCount: number;
    generatedCount: number;
  };
};

async function generateSmartNotifications(userId: string): Promise<number> {
  const expiryThreshold = nowPlusDays(EXPIRY_WINDOW_DAYS);
  let generated = 0;

  const lowStockItems = await prisma.item.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
      name: true,
      unit: true,
      minStock: true,
      batches: {
        where: { quantity: { gt: 0 } },
        select: { quantity: true },
      },
    },
  });

  for (const item of lowStockItems) {
    const currentStock = item.batches.reduce((acc, b) => acc + b.quantity, 0);
    if (currentStock > item.minStock) continue;

    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        type: NotificationType.CRITICAL_STOCK,
        isRead: false,
        metadata: {
          path: ["itemId"],
          equals: item.id,
        },
      },
      select: { id: true },
    });

    if (existing) continue;

    await prisma.notification.create({
      data: {
        userId,
        title: `Stok Kritis: ${item.name}`,
        message: `Stok ${item.name} (${item.code}) tersisa ${currentStock} ${item.unit}, di bawah batas minimum ${item.minStock} ${item.unit}. Segera lakukan pemesanan ulang.`,
        type: NotificationType.CRITICAL_STOCK,
        priority:
          currentStock === 0
            ? NotificationPriority.HIGH
            : NotificationPriority.MEDIUM,
        actionLink: "/purchase-order",
        actionLabel: "Buat Purchase Order",
        metadata: {
          itemId: item.id,
          itemCode: item.code,
          currentStock,
          minStock: item.minStock,
        },
      },
    });
    generated += 1;
  }

  const expiringBatches = await prisma.batch.findMany({
    where: {
      quantity: { gt: 0 },
      expiryDate: { lte: expiryThreshold },
    },
    select: {
      id: true,
      batchNumber: true,
      quantity: true,
      expiryDate: true,
      item: { select: { id: true, code: true, name: true, unit: true } },
    },
    orderBy: { expiryDate: "asc" },
  });

  for (const batch of expiringBatches) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        type: NotificationType.EXPIRED_WARNING,
        isRead: false,
        metadata: {
          path: ["batchId"],
          equals: batch.id,
        },
      },
      select: { id: true },
    });

    if (existing) continue;

    const daysLeft = Math.max(
      0,
      Math.ceil(
        (batch.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      ),
    );

    await prisma.notification.create({
      data: {
        userId,
        title: `ED Mendekat: ${batch.item.name}`,
        message: `Batch ${batch.batchNumber} (${batch.item.code}) — ${batch.quantity} ${batch.item.unit} akan kedaluwarsa dalam ${daysLeft} hari.`,
        type: NotificationType.EXPIRED_WARNING,
        priority:
          daysLeft <= 7
            ? NotificationPriority.HIGH
            : NotificationPriority.MEDIUM,
        actionLink: "/inventory",
        actionLabel: "Cek Inventaris",
        metadata: {
          batchId: batch.id,
          itemId: batch.item.id,
          itemCode: batch.item.code,
          daysUntilExpiry: daysLeft,
          expiryDate: batch.expiryDate.toISOString(),
        },
      },
    });
    generated += 1;
  }

  const activeAudits = await prisma.stockAudit.findMany({
    where: { status: AuditStatus.IN_PROGRESS },
    select: {
      id: true,
      auditNumber: true,
      createdAt: true,
      conductedBy: { select: { fullName: true } },
    },
  });

  for (const audit of activeAudits) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        type: NotificationType.SYSTEM_INFO,
        isRead: false,
        metadata: {
          path: ["auditId"],
          equals: audit.id,
        },
      },
      select: { id: true },
    });

    if (existing) continue;

    await prisma.notification.create({
      data: {
        userId,
        title: `Audit Stok Berlangsung`,
        message: `Audit ${audit.auditNumber} dilakukan oleh ${audit.conductedBy.fullName} sejak ${audit.createdAt.toLocaleDateString("id-ID")}. Stok sedang dalam mode freeze.`,
        type: NotificationType.SYSTEM_INFO,
        priority: NotificationPriority.HIGH,
        actionLink: "/audit",
        actionLabel: "Lihat Detail Audit",
        metadata: {
          auditId: audit.id,
          auditNumber: audit.auditNumber,
        },
      },
    });
    generated += 1;
  }

  return generated;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  const userId = session.user.id;

  try {
    const generatedCount = await generateSmartNotifications(userId);

    const [notifications, unreadCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: NOTIFICATION_LIMIT,
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    const data: SmartNotificationItem[] = notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      priority: n.priority,
      isRead: n.isRead,
      actionUrl: n.actionLink ?? null,
      actionLabel: n.actionLabel ?? null,
      metadata:
        n.metadata && typeof n.metadata === "object"
          ? (n.metadata as Record<string, unknown>)
          : null,
      createdAt: n.createdAt.toISOString(),
      timeAgo: toRelativeTime(n.createdAt),
    }));

    const payload: SmartNotificationPayload = {
      success: true,
      data: {
        notifications: data,
        unreadCount,
        generatedCount,
      },
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("[NOTIFICATIONS/GET]", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat Notification Center.",
      },
      { status: 500 },
    );
  }
}
