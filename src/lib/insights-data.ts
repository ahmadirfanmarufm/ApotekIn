import { prisma } from "@/prisma/config";

/**
 * Mengumpulkan ringkasan data operasional apotek untuk dijadikan konteks
 * bagi AI. Sengaja dibuat RINGKAS (bukan dump seluruh database) supaya:
 *  1. Prompt tetap kecil -> hemat token & lebih cepat di free tier.
 *  2. AI tidak "tersesat" di data mentah dan cenderung berhalusinasi.
 * AI hanya boleh menyimpulkan dari angka-angka ini, tidak mengarang data lain.
 */
export async function buildInsightDigest() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const [items, recentStockOuts, suppliers] = await Promise.all([
    prisma.item.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        category: true,
        minStock: true,
        maxStock: true,
        batches: {
          select: { quantity: true, expiryDate: true, batchNumber: true },
        },
      },
    }),

    prisma.stockOut.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: {
        createdAt: true,
        reason: true,
        totalAmount: true,
        items: {
          select: {
            quantity: true,
            unitPrice: true,
            batch: { select: { itemId: true } },
          },
        },
      },
    }),

    prisma.supplier.findMany({
      where: { isActive: true },
      include: {
        purchaseOrders: {
          where: { createdAt: { gte: ninetyDaysAgo } },
          select: { status: true, createdAt: true, receivedAt: true },
        },
      },
    }),
  ]);

  const itemInfoMap = new Map(items.map((i) => [i.id, i]));

  // --- Stok menipis ---
  const lowStockItems = items
    .map((item) => {
      const stock = item.batches.reduce((sum, b) => sum + b.quantity, 0);
      return { name: item.name, code: item.code, stock, minStock: item.minStock };
    })
    .filter((i) => i.stock <= i.minStock)
    .sort((a, b) => a.stock - a.minStock - (b.stock - b.minStock))
    .slice(0, 10);

  // --- Akan kedaluwarsa (30 hari) ---
  const expiringSoon = items
    .flatMap((item) =>
      item.batches
        .filter((b) => b.quantity > 0)
        .map((b) => {
          const days = Math.ceil(
            (new Date(b.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          );
          return { name: item.name, batchNumber: b.batchNumber, quantity: b.quantity, days };
        })
        .filter((b) => b.days >= 0 && b.days <= 30),
    )
    .sort((a, b) => a.days - b.days)
    .slice(0, 10);

  // --- Produk terlaris 30 hari (subset dari 14 hari yg sudah di-fetch + fallback) ---
  const salesByItem = new Map<string, number>();
  let revenueLast7 = 0;
  let revenuePrev7 = 0;

  for (const stockOut of recentStockOuts) {
    if (stockOut.reason !== "SALE") continue;

    const amount =
      Number(stockOut.totalAmount ?? 0) ||
      stockOut.items.reduce((s, it) => s + it.quantity * Number(it.unitPrice ?? 0), 0);

    if (stockOut.createdAt >= sevenDaysAgo) {
      revenueLast7 += amount;
    } else {
      revenuePrev7 += amount;
    }

    for (const it of stockOut.items) {
      const itemId = it.batch?.itemId;
      if (!itemId) continue;
      salesByItem.set(itemId, (salesByItem.get(itemId) ?? 0) + it.quantity);
    }
  }

  const topSelling = Array.from(salesByItem.entries())
    .map(([itemId, qty]) => ({ name: itemInfoMap.get(itemId)?.name ?? "?", qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // --- Slow-moving / dead stock candidate: stok tinggi tapi tidak laku 30 hari ---
  const soldItemIds = new Set(salesByItem.keys());
  const deadStockCandidates = items
    .filter((item) => {
      const stock = item.batches.reduce((sum, b) => sum + b.quantity, 0);
      return stock > item.minStock * 2 && !soldItemIds.has(item.id);
    })
    .map((item) => ({
      name: item.name,
      stock: item.batches.reduce((sum, b) => sum + b.quantity, 0),
    }))
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5);

  // --- Performa supplier (30-90 hari) ---
  const supplierStats = suppliers
    .map((s) => {
      const total = s.purchaseOrders.length;
      const completed = s.purchaseOrders.filter((po) => po.status === "COMPLETED").length;
      const fulfillmentRate = total > 0 ? (completed / total) * 100 : null;
      return { name: s.name, totalOrders: total, fulfillmentRate };
    })
    .filter((s) => s.totalOrders > 0);

  const worstSupplier =
    supplierStats.length > 0
      ? [...supplierStats].sort(
          (a, b) => (a.fulfillmentRate ?? 100) - (b.fulfillmentRate ?? 100),
        )[0]
      : null;

  const bestSupplier =
    supplierStats.length > 0
      ? [...supplierStats].sort(
          (a, b) => (b.fulfillmentRate ?? 0) - (a.fulfillmentRate ?? 0),
        )[0]
      : null;

  return {
    digest: {
      tanggalAnalisis: now.toISOString().slice(0, 10),
      totalItemAktif: items.length,
      stokMenipis: lowStockItems,
      akanKedaluwarsa30Hari: expiringSoon,
      produkTerlaris7Hari: topSelling,
      kandidatStokMati: deadStockCandidates,
      pendapatan7HariTerakhir: revenueLast7,
      pendapatan7HariSebelumnya: revenuePrev7,
      supplierTerburuk: worstSupplier,
      supplierTerbaik: bestSupplier,
      totalStockOutTerakhir14Hari: recentStockOuts.length,
    },
    snapshot: {
      lowStockCount: lowStockItems.length,
      expiringSoonCount: expiringSoon.length,
      revenueLast7Days: revenueLast7,
      revenuePrev7Days: revenuePrev7,
      topSellingItem: topSelling[0]?.name ?? null,
      worstSupplier: worstSupplier?.name ?? null,
    },
  };
}

export type InsightDigest = Awaited<ReturnType<typeof buildInsightDigest>>["digest"];
