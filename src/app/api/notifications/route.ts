import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import { endOfDay, nowPlusDays, toRelativeTime } from "@/lib/date";
import {
  ItemCategory,
  NotificationPriority,
  NotificationType,
} from "@/prisma/config";

function getInventoryLink(itemId: string, category: ItemCategory): string {
  switch (category) {
    case "OBAT_OTC":
      return `/inventory/otc/${itemId}`;
    case "BAHAN_RACIKAN":
      return `/inventory/compound/${itemId}`;
    case "NON_OBAT":
      return `/inventory/nonmedicine/${itemId}`;
    default:
      return `/inventory?itemId=${itemId}`;
  }
}

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

async function getAllActiveUserIds(): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

async function buildCriticalStockDrafts(): Promise<GeneratedDraft[]> {
  const items = await prisma.item.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
      name: true,
      category: true,
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
      actionLink: getInventoryLink(item.id, item.category),
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

  return drafts;
}

async function buildExpiryDrafts(): Promise<GeneratedDraft[]> {
  const threshold = endOfDay(nowPlusDays(EXPIRY_WARNING_DAYS));

  const items = await prisma.item.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
      name: true,
      category: true,
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
      actionLink: getInventoryLink(item.id, item.category),
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

async function persistDraftsForAllUsers(
  drafts: GeneratedDraft[],
): Promise<void> {
  const userIds = await getAllActiveUserIds();
  if (userIds.length === 0) return;

  // Build a map of dedupKey → draft for quick lookup
  const draftByKey = new Map<string, GeneratedDraft>();
  for (const d of drafts) draftByKey.set(d.dedupKey, d);

  // Fetch all existing auto-generated notifications
  const existing = await prisma.notification.findMany({
    where: {
      userId: { in: userIds },
      type: { in: ["CRITICAL_STOCK", "EXPIRED_WARNING"] },
    },
    select: { id: true, userId: true, metadata: true, actionLink: true },
  });

  const staleIds: string[] = [];
  const existingKeysByUser = new Map<string, Set<string>>();
  const toUpdate: { id: string; draft: GeneratedDraft }[] = [];

  for (const note of existing) {
    const meta = note.metadata as { dedupKey?: string } | null;
    const key = meta?.dedupKey;

    if (!key || !draftByKey.has(key)) {
      staleIds.push(note.id);
      continue;
    }

    const draft = draftByKey.get(key)!;
    // Queue update only if actionLink changed (fixes stale URL without new ID)
    if (note.actionLink !== draft.actionLink) {
      toUpdate.push({ id: note.id, draft });
    }

    const set = existingKeysByUser.get(note.userId) ?? new Set<string>();
    set.add(key);
    existingKeysByUser.set(note.userId, set);
  }

  // Build rows for new notifications only
  const newRows: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    actionLink: string;
    actionLabel: string;
    metadata: Record<string, unknown>;
  }[] = [];

  for (const userId of userIds) {
    const existingKeys = existingKeysByUser.get(userId) ?? new Set<string>();
    for (const draft of drafts) {
      if (existingKeys.has(draft.dedupKey)) continue;
      newRows.push({
        userId,
        title: draft.title,
        message: draft.message,
        type: draft.type,
        priority: draft.priority,
        actionLink: draft.actionLink,
        actionLabel: draft.actionLabel,
        metadata: { ...draft.metadata, dedupKey: draft.dedupKey },
      });
    }
  }

  // Run operations sequentially — avoids large transactions that cause P2028
  if (staleIds.length > 0) {
    await prisma.notification.deleteMany({ where: { id: { in: staleIds } } });
  }

  // Update changed actionLinks individually (usually very few)
  for (const { id, draft } of toUpdate) {
    await prisma.notification.update({
      where: { id },
      data: {
        actionLink: draft.actionLink,
        title: draft.title,
        message: draft.message,
        priority: draft.priority,
      },
    });
  }

  // Bulk-insert new notifications in one query
  if (newRows.length > 0) {
    await prisma.notification.createMany({ data: newRows });
  }
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

    const targetUserId = session.user.id;

    const [criticalDrafts, expiryDrafts] = await Promise.all([
      buildCriticalStockDrafts(),
      buildExpiryDrafts(),
    ]);

    await persistDraftsForAllUsers([...criticalDrafts, ...expiryDrafts]);

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
