"use client";

import { useState } from "react";
import {
  FileDown,
  Printer,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ReportsData } from "@/types/report";

interface ExportMenuProps {
  data: ReportsData;
}

function csvCell(value: string | number) {
  const str = String(value);

  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

function buildCsv(data: ReportsData): string {
  const lines: string[] = [];

  lines.push(
    `Laporan ApotekIn - ${csvCell(data.period.label)}`,
  );

  lines.push(
    `Dibuat pada,${csvCell(
      new Date().toLocaleString("id-ID"),
    )}`,
  );

  lines.push("");

  lines.push("RINGKASAN METRIK");

  lines.push(
    "Metrik,Nilai,Periode Sebelumnya,Perubahan (%)",
  );

  lines.push(
    [
      "Total Pendapatan",
      data.metrics.totalRevenue.value,
      data.metrics.totalRevenue.previousValue,
      data.metrics.totalRevenue.percentageChange.toFixed(1),
    ]
      .map(csvCell)
      .join(","),
  );

  lines.push(
    [
      "Total Stok Masuk",
      data.metrics.totalStockIn.value,
      data.metrics.totalStockIn.previousValue,
      data.metrics.totalStockIn.percentageChange.toFixed(1),
    ]
      .map(csvCell)
      .join(","),
  );

  lines.push(
    [
      "Perputaran Persediaan",
      data.metrics.inventoryTurnover.value.toFixed(2),
      data.metrics.inventoryTurnover.previousValue.toFixed(2),
      data.metrics.inventoryTurnover.percentageChange.toFixed(1),
    ]
      .map(csvCell)
      .join(","),
  );

  lines.push(
    [
      "Write-off Kedaluwarsa (unit)",
      data.metrics.expiredWriteOffs.value,
      data.metrics.expiredWriteOffs.previousValue,
      data.metrics.expiredWriteOffs.percentageChange.toFixed(1),
    ]
      .map(csvCell)
      .join(","),
  );

  lines.push(
    `Stok Menipis (item),${csvCell(
      data.metrics.lowStockItems,
    )}`,
  );

  lines.push(
    `Item Kedaluwarsa Saat Ini,${csvCell(
      data.metrics.expiredItemsNow,
    )}`,
  );

  lines.push("");

  lines.push("RINGKASAN KEUANGAN");
  lines.push("Item,Nilai (Rp)");

  lines.push(
    `Pendapatan,${csvCell(data.financial.revenue.value)}`,
  );

  lines.push(
    `Estimasi HPP,${csvCell(data.financial.cogs.value)}`,
  );

  lines.push(
    `Estimasi Laba Kotor,${csvCell(
      data.financial.grossProfit.value,
    )}`,
  );

  lines.push(
    `Margin Kotor (%),${csvCell(
      data.financial.marginPercent.toFixed(1),
    )}`,
  );

  lines.push("");

  lines.push("TREN HARIAN");
  lines.push("Tanggal,Stok Masuk,Stok Keluar,Pendapatan");

  data.trends.forEach((t) => {
    lines.push(
      [t.label, t.stockIn, t.stockOut, t.revenue]
        .map(csvCell)
        .join(","),
    );
  });

  lines.push("");

  lines.push("EFISIENSI PER KATEGORI");

  lines.push(
    "Kategori,Stok Masuk,Stok Keluar,Turnover Rate,Efisiensi (%),Trend (%)",
  );

  data.efficiency.forEach((e) => {
    lines.push(
      [
        e.category,
        e.stockIn,
        e.stockOut,
        e.turnoverRate.toFixed(2),
        e.efficiency.toFixed(1),
        e.trendChange.toFixed(1),
      ]
        .map(csvCell)
        .join(","),
    );
  });

  lines.push("");

  lines.push("PRODUK TERLARIS");

  lines.push(
    "Nama,Kode,Kategori,Unit Terjual,Pendapatan (Rp)",
  );

  data.topProducts.forEach((p) => {
    lines.push(
      [
        p.name,
        p.code,
        p.category,
        p.quantitySold,
        p.revenue,
      ]
        .map(csvCell)
        .join(","),
    );
  });

  lines.push("");

  lines.push("PERFORMA PEMASOK");

  lines.push(
    "Nama,Total PO,PO Selesai,Fulfillment Rate (%),Rata-rata Lead Time (hari)",
  );

  data.suppliers.forEach((s) => {
    lines.push(
      [
        s.name,
        s.totalOrders,
        s.completedOrders,
        s.fulfillmentRate.toFixed(1),
        s.averageLeadTime.toFixed(1),
      ]
        .map(csvCell)
        .join(","),
    );
  });

  return "\uFEFF" + lines.join("\n");
}

export function ExportMenu({ data }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCsv = () => {
    setIsExporting(true);

    try {
      const csv = buildCsv(data);

      const blob = new Blob(
        [csv],
        {
          type: "text/csv;charset=utf-8;",
        },
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `laporan-apotekin-${
        data.period.key
      }-${new Date().toISOString().slice(0, 10)}.csv`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
      <Button
        variant="outline"
        onClick={handleExportCsv}
        disabled={isExporting}
        className="w-full border-slate-200 bg-white shadow-sm sm:w-auto"
      >
        {isExporting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="mr-2 h-4 w-4" />
        )}

        Ekspor CSV
      </Button>

      <Button
        onClick={handlePrint}
        className="w-full bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 sm:w-auto"
      >
        <Printer className="mr-2 h-4 w-4" />

        Cetak / Simpan PDF
      </Button>
    </div>
  );
}