import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/config";

type ReportPeriod =
  | "3d"
  | "10d"
  | "20d"
  | "1m"
  | "3m"
  | "6m"
  | "1y"
  | "all";

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  "3d": "3 Hari Terakhir",
  "10d": "10 Hari Terakhir",
  "20d": "20 Hari Terakhir",
  "1m": "1 Bulan Terakhir",
  "3m": "3 Bulan Terakhir",
  "6m": "6 Bulan Terakhir",
  "1y": "1 Tahun Terakhir",
  all: "Semua Waktu",
};

const VALID_PERIODS: ReportPeriod[] = [
  "3d",
  "10d",
  "20d",
  "1m",
  "3m",
  "6m",
  "1y",
  "all",
];

/**
 * Mengurangi jumlah bulan dari sebuah tanggal dengan aman.
 * Native `new Date(y, m - n, d)` bisa overflow ke bulan berikutnya
 * jika `d` melebihi jumlah hari di bulan target (mis. 31 Maret - 1 bulan
 * akan "meluber" ke 3 Maret, bukan clamp ke 28/29 Februari).
 * Fungsi ini meng-clamp tanggal ke hari terakhir bulan target.
 */
function subtractMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() - months, 1);
  const lastDayOfTargetMonth = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate();

  target.setDate(Math.min(date.getDate(), lastDayOfTargetMonth));
  target.setHours(date.getHours(), date.getMinutes(), date.getSeconds());

  return target;
}

function getPeriodStart(period: ReportPeriod, now: Date): Date | null {
  switch (period) {
    case "3d":
      return new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    case "10d":
      return new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    case "20d":
      return new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
    case "1m":
      return subtractMonths(now, 1);
    case "3m":
      return subtractMonths(now, 3);
    case "6m":
      return subtractMonths(now, 6);
    case "1y":
      return subtractMonths(now, 12);
    case "all":
      return null;
    default:
      return subtractMonths(now, 6);
  }
}

function getPreviousPeriod(
  startDate: Date | null,
  endDate: Date,
): { start: Date | null; end: Date } {
  if (!startDate) {
    return { start: null, end: endDate };
  }

  const duration = endDate.getTime() - startDate.getTime();

  return {
    start: new Date(startDate.getTime() - duration),
    end: startDate,
  };
}

function calculatePercentageChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / Math.abs(previous)) * 100;
}

function inRange(date: Date, start: Date | null, end: Date): boolean {
  const t = date.getTime();
  if (start && t < start.getTime()) return false;
  return t <= end.getTime();
}

function toMetric(current: number, previous: number) {
  return {
    value: current,
    previousValue: previous,
    percentageChange: calculatePercentageChange(current, previous),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedPeriod = searchParams.get("period");

    const period: ReportPeriod =
      requestedPeriod && VALID_PERIODS.includes(requestedPeriod as ReportPeriod)
        ? (requestedPeriod as ReportPeriod)
        : "6m";

    const endDate = new Date();
    const startDate = getPeriodStart(period, endDate);
    const previousPeriod = getPreviousPeriod(startDate, endDate);

    // Batas bawah data yang perlu diambil dari DB: cukup sejak awal periode
    // SEBELUMNYA (mencakup periode sekarang + periode pembanding + data untuk
    // rekonstruksi stok historis). null berarti ambil semua data.
    const fetchLowerBound = previousPeriod.start;

    /**
     * ============================
     * SATU KALI FETCH UNTUK SEMUA
     * ============================
     * Semua metrik (trend, turnover, efisiensi kategori, produk terlaris,
     * write-off kedaluwarsa) dihitung dari SATU sumber data yang sama:
     * StockReceipt (stok masuk) dan StockOut (stok keluar). Ini menghindari
     * dua sumber data paralel yang bisa saling tidak sinkron, dan menghindari
     * query berulang ke database untuk hal yang sama.
     */
    const [items, receipts, stockOuts, suppliers] = await Promise.all([
      // Semua item aktif beserta batch-nya (dipakai untuk: stok saat ini,
      // low stock, expired now, expiring soon, dan peta kategori/nama item).
      prisma.item.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          code: true,
          category: true,
          minStock: true,
          batches: {
            select: {
              id: true,
              batchNumber: true,
              quantity: true,
              expiryDate: true,
            },
          },
        },
      }),

      // Semua stok masuk sejak awal periode pembanding.
      prisma.stockReceipt.findMany({
        where: fetchLowerBound
          ? { receivedAt: { gte: fetchLowerBound, lte: endDate } }
          : {},
        select: {
          receivedAt: true,
          items: {
            select: { itemId: true, quantity: true, unitPrice: true },
          },
        },
      }),

      // Semua stok keluar sejak awal periode pembanding (semua alasan;
      // difilter per-kasus di JS agar tidak perlu banyak query terpisah).
      prisma.stockOut.findMany({
        where: fetchLowerBound
          ? { createdAt: { gte: fetchLowerBound, lte: endDate } }
          : {},
        select: {
          createdAt: true,
          reason: true,
          totalAmount: true,
          items: {
            select: {
              quantity: true,
              unitPrice: true,
              batch: {
                select: { itemId: true, buyPrice: true },
              },
            },
          },
        },
      }),

      // Supplier aktif (diambil semua dulu, TIDAK dibatasi jumlahnya di sini
      // -- pembatasan top-N harus dilakukan SETELAH sorting berdasarkan
      // performa, bukan sebelumnya).
      prisma.supplier.findMany({
        where: { isActive: true },
        include: {
          purchaseOrders: {
            where: fetchLowerBound
              ? { createdAt: { gte: startDate ?? fetchLowerBound, lte: endDate } }
              : {},
            select: {
              id: true,
              status: true,
              createdAt: true,
              receivedAt: true,
            },
          },
        },
      }),
    ]);

    // Peta bantu: itemId -> info item (nama, kode, kategori)
    const itemInfoMap = new Map(
      items.map((item) => [
        item.id,
        { name: item.name, code: item.code, category: item.category },
      ]),
    );

    /*
     * ============================
     * FLATTEN DATA UNTUK AGREGASI
     * ============================
     */
    const flatReceiptItems = receipts.flatMap((receipt) =>
      receipt.items.map((item) => ({
        date: receipt.receivedAt,
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice ?? 0),
        category: itemInfoMap.get(item.itemId)?.category ?? "LAINNYA",
      })),
    );

    const flatStockOutItems = stockOuts.flatMap((stockOut) =>
      stockOut.items.map((item) => {
        const itemId = item.batch?.itemId ?? null;

        return {
          date: stockOut.createdAt,
          reason: stockOut.reason,
          itemId,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice ?? 0),
          buyPrice: Number(item.batch?.buyPrice ?? 0),
          category: itemId
            ? itemInfoMap.get(itemId)?.category ?? "LAINNYA"
            : "LAINNYA",
        };
      }),
    );

    const sumQty = (arr: { quantity: number }[]) =>
      arr.reduce((total, item) => total + item.quantity, 0);

    /*
     * ============================
     * STOK SAAT INI (LIVE)
     * ============================
     */
    const liveEndingInventory = items.reduce(
      (total, item) =>
        total + item.batches.reduce((sum, batch) => sum + batch.quantity, 0),
      0,
    );

    /**
     * Merekonstruksi perkiraan level inventaris pada suatu tanggal di masa
     * lalu, tanpa perlu tabel snapshot historis: level di tanggal tsb =
     * level sekarang dikurangi net-movement (stok masuk - stok keluar)
     * yang terjadi SETELAH tanggal tersebut hingga sekarang.
     *
     * Catatan: pendekatan ini akurat selama data stok masuk/keluar sejak
     * tanggal tsb lengkap tercatat di sistem. Untuk akurasi jangka panjang,
     * pertimbangkan menambah tabel snapshot stok harian melalui cron job.
     */
    function inventoryLevelAt(date: Date): number {
      const inAfter = sumQty(
        flatReceiptItems.filter((r) => r.date.getTime() >= date.getTime()),
      );
      const outAfter = sumQty(
        flatStockOutItems.filter((o) => o.date.getTime() >= date.getTime()),
      );

      return Math.max(liveEndingInventory - inAfter + outAfter, 0);
    }

    /*
     * ============================
     * INVENTORY TURNOVER
     * ============================
     */
    function calculateTurnover(start: Date | null, end: Date) {
      const salesInRange = sumQty(
        flatStockOutItems.filter(
          (o) => o.reason === "SALE" && inRange(o.date, start, end),
        ),
      );

      if (!start) {
        return {
          turnoverRate:
            liveEndingInventory > 0 ? salesInRange / liveEndingInventory : 0,
          sales: salesInRange,
        };
      }

      const beginningInventory = inventoryLevelAt(start);
      const endingInventory =
        end.getTime() >= endDate.getTime()
          ? liveEndingInventory
          : inventoryLevelAt(end);

      const averageInventory = (beginningInventory + endingInventory) / 2;

      return {
        turnoverRate: averageInventory > 0 ? salesInRange / averageInventory : 0,
        sales: salesInRange,
      };
    }

    const currentTurnover = calculateTurnover(startDate, endDate);
    const previousTurnover = previousPeriod.start
      ? calculateTurnover(previousPeriod.start, previousPeriod.end)
      : { turnoverRate: 0, sales: 0 };

    /*
     * ============================
     * STOK MASUK / STOK KELUAR (RINGKASAN)
     * ============================
     */
    const currentStockIn = sumQty(
      flatReceiptItems.filter((r) => inRange(r.date, startDate, endDate)),
    );
    const previousStockIn = previousPeriod.start
      ? sumQty(
          flatReceiptItems.filter((r) =>
            inRange(r.date, previousPeriod.start, previousPeriod.end),
          ),
        )
      : 0;

    /*
     * ============================
     * PENDAPATAN & COGS (HANYA DARI SALE)
     * ============================
     */
    function calculateRevenue(start: Date | null, end: Date) {
      return stockOuts
        .filter((s) => s.reason === "SALE" && inRange(s.createdAt, start, end))
        .reduce((total, transaction) => {
          const transactionAmount = Number(transaction.totalAmount ?? 0);

          if (transactionAmount > 0) {
            return total + transactionAmount;
          }

          return (
            total +
            transaction.items.reduce(
              (sum, item) =>
                sum + item.quantity * Number(item.unitPrice ?? 0),
              0,
            )
          );
        }, 0);
    }

    function calculateCogs(start: Date | null, end: Date) {
      return flatStockOutItems
        .filter((o) => o.reason === "SALE" && inRange(o.date, start, end))
        .reduce((total, o) => total + o.quantity * o.buyPrice, 0);
    }

    const currentRevenue = calculateRevenue(startDate, endDate);
    const previousRevenue = previousPeriod.start
      ? calculateRevenue(previousPeriod.start, previousPeriod.end)
      : 0;

    const currentCogs = calculateCogs(startDate, endDate);
    const previousCogs = previousPeriod.start
      ? calculateCogs(previousPeriod.start, previousPeriod.end)
      : 0;

    const currentGrossProfit = currentRevenue - currentCogs;
    const previousGrossProfit = previousRevenue - previousCogs;

    const currentMargin =
      currentRevenue > 0 ? (currentGrossProfit / currentRevenue) * 100 : 0;
    const previousMargin =
      previousRevenue > 0
        ? (previousGrossProfit / previousRevenue) * 100
        : 0;

    /*
     * ============================
     * WRITE-OFF KEDALUWARSA (PERIODE)
     * ============================
     * Dihitung dari StockOut dengan reason EXPIRED yang benar-benar dicatat
     * dalam periode berjalan -- ini metrik yang time-bound & bisa
     * dibandingkan dengan periode sebelumnya secara valid, berbeda dengan
     * "jumlah item kedaluwarsa saat ini" yang sifatnya snapshot langsung.
     */
    const currentExpiredWriteOffs = sumQty(
      flatStockOutItems.filter(
        (o) => o.reason === "EXPIRED" && inRange(o.date, startDate, endDate),
      ),
    );
    const previousExpiredWriteOffs = previousPeriod.start
      ? sumQty(
          flatStockOutItems.filter(
            (o) =>
              o.reason === "EXPIRED" &&
              inRange(o.date, previousPeriod.start, previousPeriod.end),
          ),
        )
      : 0;

    /*
     * ============================
     * LOW STOCK & EXPIRED (KONDISI SAAT INI)
     * ============================
     */
    const now = new Date();
    let lowStockItems = 0;
    let expiredItemsNow = 0;

    const expiringSoon: {
      itemId: string;
      itemName: string;
      itemCode: string;
      batchNumber: string;
      quantity: number;
      expiryDate: string;
      daysUntilExpiry: number;
    }[] = [];

    const EXPIRING_SOON_WINDOW_DAYS = 30;

    for (const item of items) {
      const totalStock = item.batches.reduce(
        (sum, batch) => sum + batch.quantity,
        0,
      );

      if (totalStock <= item.minStock) {
        lowStockItems++;
      }

      const hasExpiredBatch = item.batches.some(
        (batch) => batch.quantity > 0 && new Date(batch.expiryDate) < now,
      );

      if (hasExpiredBatch) {
        expiredItemsNow++;
      }

      for (const batch of item.batches) {
        if (batch.quantity <= 0) continue;

        const expiryDate = new Date(batch.expiryDate);
        const daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysUntilExpiry >= 0 && daysUntilExpiry <= EXPIRING_SOON_WINDOW_DAYS) {
          expiringSoon.push({
            itemId: item.id,
            itemName: item.name,
            itemCode: item.code,
            batchNumber: batch.batchNumber,
            quantity: batch.quantity,
            expiryDate: expiryDate.toISOString(),
            daysUntilExpiry,
          });
        }
      }
    }

    expiringSoon.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    /*
     * ============================
     * SUPPLIER PERFORMANCE
     * (sort dulu berdasarkan performa, BARU dibatasi jumlahnya)
     * ============================
     */
    const supplierPerformance = suppliers
      .map((supplier) => {
        const totalOrders = supplier.purchaseOrders.length;
        const completedOrders = supplier.purchaseOrders.filter(
          (po) => po.status === "COMPLETED",
        ).length;

        const fulfillmentRate =
          totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

        const leadTimes = supplier.purchaseOrders
          .filter((po) => po.receivedAt && po.createdAt)
          .map((po) => {
            const diff =
              new Date(po.receivedAt!).getTime() -
              new Date(po.createdAt).getTime();
            return diff / (1000 * 60 * 60 * 24);
          });

        const averageLeadTime =
          leadTimes.length > 0
            ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length
            : 0;

        return {
          id: supplier.id,
          name: supplier.name,
          totalOrders,
          completedOrders,
          fulfillmentRate,
          averageLeadTime,
        };
      })
      .sort((a, b) => b.fulfillmentRate - a.fulfillmentRate)
      .slice(0, 20);

    /*
     * ============================
     * EFISIENSI PER KATEGORI (dengan trend riil)
     * ============================
     */
    const categories = ["OBAT_OTC", "BAHAN_RACIKAN", "NON_OBAT"] as const;
    const categoryLabels: Record<(typeof categories)[number], string> = {
      OBAT_OTC: "Obat OTC",
      BAHAN_RACIKAN: "Bahan Racikan",
      NON_OBAT: "Non Obat",
    };

    function categoryRatio(
      category: string,
      start: Date | null,
      end: Date,
    ): { stockIn: number; stockOut: number; ratio: number } {
      const stockIn = sumQty(
        flatReceiptItems.filter(
          (r) => r.category === category && inRange(r.date, start, end),
        ),
      );
      const stockOut = sumQty(
        flatStockOutItems.filter(
          (o) => o.category === category && inRange(o.date, start, end),
        ),
      );

      return {
        stockIn,
        stockOut,
        ratio: stockIn > 0 ? stockOut / stockIn : 0,
      };
    }

    const efficiency = categories.map((category) => {
      const current = categoryRatio(category, startDate, endDate);
      const previous = previousPeriod.start
        ? categoryRatio(category, previousPeriod.start, previousPeriod.end)
        : { stockIn: 0, stockOut: 0, ratio: 0 };

      const efficiencyValue =
        current.stockIn > 0 ? Math.min(current.ratio * 100, 100) : 0;

      return {
        category: categoryLabels[category],
        stockIn: current.stockIn,
        stockOut: current.stockOut,
        turnoverRate: current.ratio,
        efficiency: efficiencyValue,
        trendChange: calculatePercentageChange(current.ratio, previous.ratio),
      };
    });

    /*
     * ============================
     * PRODUK TERLARIS (FITUR BARU)
     * ============================
     */
    const salesByItem = new Map<
      string,
      { quantitySold: number; revenue: number }
    >();

    for (const o of flatStockOutItems) {
      if (o.reason !== "SALE" || !o.itemId) continue;
      if (!inRange(o.date, startDate, endDate)) continue;

      const existing = salesByItem.get(o.itemId) ?? {
        quantitySold: 0,
        revenue: 0,
      };

      salesByItem.set(o.itemId, {
        quantitySold: existing.quantitySold + o.quantity,
        revenue: existing.revenue + o.quantity * o.unitPrice,
      });
    }

    const topProducts = Array.from(salesByItem.entries())
      .map(([itemId, stat]) => {
        const info = itemInfoMap.get(itemId);
        return {
          itemId,
          name: info?.name ?? "Item tidak diketahui",
          code: info?.code ?? "-",
          category: info?.category ?? "LAINNYA",
          quantitySold: stat.quantitySold,
          revenue: stat.revenue,
        };
      })
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 8);

    /*
     * ============================
     * TREND HARIAN (CHART)
     * ============================
     */
    type TrendValue = { revenue: number; stockIn: number; stockOut: number };
    const trendMap = new Map<string, TrendValue>();

    const getLocalDateKey = (date: Date) =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);

    for (const r of flatReceiptItems) {
      if (!inRange(r.date, startDate, endDate)) continue;
      const key = getLocalDateKey(r.date);
      const existing = trendMap.get(key) ?? { revenue: 0, stockIn: 0, stockOut: 0 };
      trendMap.set(key, { ...existing, stockIn: existing.stockIn + r.quantity });
    }

    for (const stockOut of stockOuts) {
      if (!inRange(stockOut.createdAt, startDate, endDate)) continue;

      const key = getLocalDateKey(stockOut.createdAt);
      const stockOutQuantity = stockOut.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const revenue =
        stockOut.reason === "SALE" ? Number(stockOut.totalAmount ?? 0) : 0;

      const existing = trendMap.get(key) ?? { revenue: 0, stockIn: 0, stockOut: 0 };
      trendMap.set(key, {
        ...existing,
        revenue: existing.revenue + revenue,
        stockOut: existing.stockOut + stockOutQuantity,
      });
    }

    const trends = Array.from(trendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({
        label: new Intl.DateTimeFormat("id-ID", {
          timeZone: "Asia/Jakarta",
          day: "2-digit",
          month: "short",
        }).format(new Date(`${date}T00:00:00+07:00`)),
        revenue: value.revenue,
        stockIn: value.stockIn,
        stockOut: value.stockOut,
      }));

    /*
     * ============================
     * HEALTH SCORE
     * ============================
     */
    const healthScore = Math.max(
      0,
      Math.min(100, 100 - lowStockItems * 3 - expiredItemsNow * 2),
    );

    return NextResponse.json({
      success: true,
      data: {
        period: {
          key: period,
          label: PERIOD_LABELS[period],
          startDate: startDate?.toISOString() ?? null,
          endDate: endDate.toISOString(),
        },

        metrics: {
          totalRevenue: toMetric(currentRevenue, previousRevenue),
          totalStockIn: toMetric(currentStockIn, previousStockIn),
          inventoryTurnover: toMetric(
            currentTurnover.turnoverRate,
            previousTurnover.turnoverRate,
          ),
          expiredWriteOffs: toMetric(
            currentExpiredWriteOffs,
            previousExpiredWriteOffs,
          ),
          expiredItemsNow,
          lowStockItems,
        },

        financial: {
          revenue: toMetric(currentRevenue, previousRevenue),
          cogs: toMetric(currentCogs, previousCogs),
          grossProfit: toMetric(currentGrossProfit, previousGrossProfit),
          marginPercent: currentMargin,
          previousMarginPercent: previousMargin,
        },

        trends,
        suppliers: supplierPerformance,
        efficiency,
        topProducts,
        expiringSoon: expiringSoon.slice(0, 15),

        summary: {
          healthScore,
          message:
            healthScore >= 80
              ? "Kondisi inventaris dalam keadaan sehat dan stabil."
              : healthScore >= 60
                ? "Kondisi inventaris cukup stabil, namun beberapa area perlu diperhatikan."
                : "Kondisi inventaris membutuhkan perhatian lebih.",
        },
      },
    });
  } catch (error) {
    console.error("REPORTS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data laporan.",
      },
      { status: 500 },
    );
  }
}
