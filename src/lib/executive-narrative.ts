import type { NarrativePayload, NarrativeSeverity } from "@/types/dashboard";
import { formatRupiah } from "@/lib/format";

export interface NarrativeInput {
  healthScore: number;
  criticalCount: number;
  topCriticalItem: { itemName: string; daysUntilExpiry: number | null } | null;
  fastMovingName: string | null;
  fastMovingQty: number;
  fefoCompliancePct: number;
  revenue30d: number;
  expense30d: number;
  marginPct: number;
  pendingTasksCount: number;
  onTimeSupplierPct: number;
  hasAnyData: boolean;
}

const SAFE_HEALTH = 80;
const WARN_HEALTH = 60;
const CRITICAL_COUNT_WARNING = 3;
const CRITICAL_COUNT_CRITICAL = 10;
const FEFO_MIN = 85;
const ONTIME_MIN = 80;

export function classifySeverity(input: NarrativeInput): NarrativeSeverity {
  if (
    input.healthScore < WARN_HEALTH ||
    input.criticalCount >= CRITICAL_COUNT_CRITICAL
  ) {
    return "CRITICAL";
  }
  if (
    input.healthScore < SAFE_HEALTH ||
    input.criticalCount > CRITICAL_COUNT_WARNING ||
    input.fefoCompliancePct < FEFO_MIN
  ) {
    return "WARNING";
  }
  return "GOOD";
}

export function buildNarrative(input: NarrativeInput): NarrativePayload {
  const severity = classifySeverity(input);
  return {
    headline: buildHeadline(input, severity),
    insight: buildInsight(input),
    recommendation: buildRecommendation(input, severity),
    severity,
  };
}

function buildHeadline(
  input: NarrativeInput,
  severity: NarrativeSeverity,
): string {
  if (!input.hasAnyData) {
    return "Belum ada data inventaris yang cukup untuk dianalisis. Mulai catat transaksi untuk melihat ringkasan otomatis.";
  }

  switch (severity) {
    case "CRITICAL":
      return `Inventaris butuh perhatian segera — ${input.criticalCount} item dalam kondisi kritis (health score ${input.healthScore}%).`;
    case "WARNING":
      return `Kondisi inventaris cukup stabil, namun ${input.criticalCount} item masih memerlukan tindak lanjut.`;
    case "GOOD":
      return `Kondisi inventaris sangat sehat dengan health score ${input.healthScore}% dan ${input.criticalCount} item kritis.`;
  }
}

function buildInsight(input: NarrativeInput): string {
  if (!input.hasAnyData) {
    return "Sistem akan otomatis menghasilkan ringkasan setelah ada data stok, penjualan, dan aktivitas.";
  }

  const parts: string[] = [];

  if (input.fastMovingName && input.fastMovingQty > 0) {
    parts.push(
      `Item dengan perputaran tertinggi 24 jam terakhir adalah ${input.fastMovingName} (${input.fastMovingQty.toLocaleString("id-ID")} unit terjual).`,
    );
  }

  if (input.revenue30d > 0 || input.expense30d > 0) {
    const marginSign = input.marginPct >= 0 ? "positif" : "negatif";
    parts.push(
      `Margin 30 hari terakhir tercatat ${marginSign} di ${input.marginPct.toFixed(1)}% (pendapatan ${formatRupiah(input.revenue30d)}, pengeluaran ${formatRupiah(input.expense30d)}).`,
    );
  } else {
    parts.push(
      "Belum ada transaksi penjualan atau pembelian dalam 30 hari terakhir.",
    );
  }

  if (input.fefoCompliancePct < 100) {
    if (input.fefoCompliancePct < FEFO_MIN) {
      parts.push(
        `Kepatuhan FEFO hanya ${input.fefoCompliancePct}% — cukup banyak penjualan yang tidak mengambil dari batch terlama.`,
      );
    } else {
      parts.push(`Kepatuhan FEFO tercatat ${input.fefoCompliancePct}%.`);
    }
  }

  if (input.onTimeSupplierPct > 0 && input.onTimeSupplierPct < ONTIME_MIN) {
    parts.push(
      `Performa pengiriman supplier berada di ${input.onTimeSupplierPct}% tepat waktu, di bawah standar ${ONTIME_MIN}%.`,
    );
  } else if (input.onTimeSupplierPct >= ONTIME_MIN) {
    parts.push(
      `Performa supplier cukup baik: ${input.onTimeSupplierPct}% pengiriman tepat waktu.`,
    );
  }

  return parts.join(" ");
}

function buildRecommendation(
  input: NarrativeInput,
  severity: NarrativeSeverity,
): string {
  if (!input.hasAnyData) {
    return "Mulai dengan menambahkan item inventaris dan mencatat transaksi pertama untuk mengaktifkan analisis otomatis.";
  }

  if (severity === "CRITICAL" && input.topCriticalItem) {
    const days = input.topCriticalItem.daysUntilExpiry;
    const dayText =
      days === null ? "segera" : days <= 0 ? "hari ini" : `dalam ${days} hari`;
    return `Prioritaskan proses ulang ${input.topCriticalItem.itemName} yang akan kedaluwarsa ${dayText}, dan buat purchase order untuk ${input.criticalCount} item kritis.`;
  }

  if (severity === "WARNING" && input.pendingTasksCount > 0) {
    return `Selesaikan ${input.pendingTasksCount} tugas prioritas hari ini dan monitor ${input.criticalCount} item kritis untuk mencegah stockout.`;
  }

  if (input.fastMovingName) {
    return `Pertahankan ketersediaan stok ${input.fastMovingName} yang menjadi penggerak utama penjualan, dan jadwalkan stock audit ringan untuk validasi data.`;
  }

  return "Pertahankan pola operasional saat ini dan lakukan stock audit rutin setiap 2 minggu untuk menjaga keakuratan data.";
}
