import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import { nowPlusDays, startOfDay, toRelativeTime } from "@/lib/date";
import { NotificationPriority, NotificationType } from "@/prisma/config";

export const dynamic = "force-dynamic";

const EXPIRY_WARNING_DAYS = 30;
const MAX_NOTIFICATIONS = 10;
const MAX_PAGE_SIZE = 100;
const TYPE_LABELS: Record<NotificationType, string> = {
  CRITICAL_STOCK: "Stok Kritis",
  EXPIRED_WARNING: "Peringatan Kedaluwarsa",
  ACTION_RECOMMENDATION: "Rekomendasi Tindakan",
  SYSTEM_INFO: "Informasi Sistem",
  AUDIT_FREEZE: "Audit Freeze",
};

const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  HIGH: "Tinggi",
  MEDIUM: "Sedang",
  LOW: "Rendah",
};

type GeneratedDraft = {
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionLink: string;
  actionLabel: string;
  metadata: Record<string, unknown>;
  dedupKey: string;
};

async function getOrCreateSystemUserId(): Promise<string> {
  const owner = await prisma.user.findFirst({
    where: { role: "OWNER" },
    select: { id: true },
  });

  if (owner) return owner.id;

  const admin = await prisma.user.findFirst({
    where: { role: "ADMINISTRATOR" },
    select: { id: true },
  });

  if (!admin) {
    throw new Error(
      "No system user (OWNER/ADMINISTRATOR) available to own notifications.",
    );
  }

  return admin.id;
}

async function buildCriticalStockDrafts(
  userId: string,
): Promise<GeneratedDraft[]> {
  const items = await prisma.item.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
      name: true,
      minStock: true,
      batches: {
        where: { quantity: { gt: 0 } },
        select: { quantity: true },
      },
    },
  });

  const drafts: GeneratedDraft[] = [];

  for (const item of items) {
    const currentStock = item.batches.reduce((sum, b) => sum + b.quantity, 0);
    if (currentStock > item.minStock) continue;

    drafts.push({
      type: "CRITICAL_STOCK",
      priority: currentStock === 0 ? "HIGH" : "MEDIUM",
      title: `Stok ${item.name} mencapai batas minimum`,
      message: `Sisa stok ${currentStock} dari batas minimum ${item.minStock}. Segera lakukan pemesanan ulang.`,
      actionLink: `/inventory?itemId=${item.id}`,
      actionLabel: "Lihat Inventaris",
      metadata: {
        itemId: item.id,
        itemCode: item.code,
        currentStock,
        minStock: item.minStock,
      },
      dedupKey: `CRITICAL_STOCK:${item.id}`,
    });
  }

  void userId;
  return drafts;
}

async function buildExpiryDrafts(): Promise<GeneratedDraft[]> {
  const threshold = startOfDay(nowPlusDays(EXPIRY_WARNING_DAYS));

  const items = await prisma.item.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
      name: true,
      batches: {
        where: {
          quantity: { gt: 0 },
          expiryDate: { lte: threshold },
        },
        orderBy: { expiryDate: "asc" },
        select: {
          id: true,
          batchNumber: true,
          quantity: true,
          expiryDate: true,
        },
      },
    },
  });

  const drafts: GeneratedDraft[] = [];

  for (const item of items) {
    const batch = item.batches[0];
    if (!batch) continue;

    const daysLeft = Math.ceil(
      (batch.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    const priority: NotificationPriority = daysLeft <= 7 ? "HIGH" : "MEDIUM";

    drafts.push({
      type: "EXPIRED_WARNING",
      priority,
      title: `${item.name} mendekati tanggal kedaluwarsa`,
      message: `Batch ${batch.batchNumber} akan kedaluwarsa dalam ${daysLeft} hari (${batch.quantity} pcs).`,
      actionLink: `/inventory?itemId=${item.id}`,
      actionLabel: "Tinjau Batch",
      metadata: {
        itemId: item.id,
        itemCode: item.code,
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate.toISOString(),
        daysLeft,
        quantity: batch.quantity,
      },
      dedupKey: `EXPIRED_WARNING:${batch.id}`,
    });
  }

  return drafts;
}

async function persistDrafts(
  userId: string,
  drafts: GeneratedDraft[],
): Promise<void> {
  if (drafts.length === 0) return;

  const existing = await prisma.notification.findMany({
    where: {
      userId,
      isRead: false,
      type: { in: ["CRITICAL_STOCK", "EXPIRED_WARNING"] },
    },
    select: { metadata: true, type: true },
  });

  const existingKeys = new Set<string>();
  for (const note of existing) {
    const meta = note.metadata as { dedupKey?: string } | null;
    if (meta?.dedupKey) existingKeys.add(meta.dedupKey);
  }

  const fresh = drafts.filter((d) => !existingKeys.has(d.dedupKey));
  if (fresh.length === 0) return;

  await prisma.$transaction(
    fresh.map((d) =>
      prisma.notification.create({
        data: {
          userId,
          title: d.title,
          message: d.message,
          type: d.type,
          priority: d.priority,
          actionLink: d.actionLink,
          actionLabel: d.actionLabel,
          metadata: d.metadata as object,
        },
      }),
    ),
  );
}

function serializeNotification(n: {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  actionLink: string | null;
  actionLabel: string | null;
  createdAt: Date;
}) {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    typeLabel: TYPE_LABELS[n.type],
    priority: n.priority,
    priorityLabel: PRIORITY_LABELS[n.priority],
    isRead: n.isRead,
    actionLink: n.actionLink,
    actionLabel: n.actionLabel,
    createdAt: n.createdAt.toISOString(),
    relativeTime: toRelativeTime(n.createdAt),
  };
}

function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20),
  );
  return { page, limit, skip: (page - 1) * limit };
}

function parseFilterParams(searchParams: URLSearchParams) {
  const validTypes = new Set(Object.keys(TYPE_LABELS) as NotificationType[]);
  const rawType = searchParams.get("type");
  const type: NotificationType | null =
    rawType && validTypes.has(rawType as NotificationType)
      ? (rawType as NotificationType)
      : null;

  const rawRead = searchParams.get("isRead");
  let isRead: boolean | null = null;
  if (rawRead === "true") isRead = true;
  else if (rawRead === "false") isRead = false;

  return { type, isRead };
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const isPaginated = searchParams.has("page") || searchParams.has("limit");

    const ownerId = await getOrCreateSystemUserId();
    const targetUserId = session.user.id;

    const [criticalDrafts, expiryDrafts] = await Promise.all([
      buildCriticalStockDrafts(targetUserId),
      buildExpiryDrafts(),
    ]);

    await persistDrafts(ownerId, [...criticalDrafts, ...expiryDrafts]);

    const unreadCount = await prisma.notification.count({
      where: { userId: targetUserId, isRead: false },
    });

    if (!isPaginated) {
      const notifications = await prisma.notification.findMany({
        where: { userId: targetUserId },
        orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
        take: MAX_NOTIFICATIONS,
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          priority: true,
          isRead: true,
          actionLink: true,
          actionLabel: true,
          createdAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: notifications.map(serializeNotification),
        unreadCount,
      });
    }

    const { page, limit, skip } = parsePaginationParams(searchParams);
    const { type, isRead } = parseFilterParams(searchParams);

    const where: {
      userId: string;
      type?: NotificationType;
      isRead?: boolean;
    } = { userId: targetUserId };
    if (type) where.type = type;
    if (isRead !== null) where.isRead = isRead;

    const [notifications, totalItems] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          priority: true,
          isRead: true,
          actionLink: true,
          actionLabel: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return NextResponse.json({
      success: true,
      data: notifications.map(serializeNotification),
      unreadCount,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
      filters: { type, isRead },
    });
  } catch (error) {
    console.error("[NOTIFICATIONS/GET]", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data notifikasi." },
      { status: 500 },
    );
  }
}
