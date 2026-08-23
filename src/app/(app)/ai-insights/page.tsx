"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import { AiInsightsHeader } from "@/components/ai-insights/AiInsightsHeader";
import { InventoryHealthSection } from "@/components/ai-insights/InventoryHealthSection";
import { FinancialAnalysisSection } from "@/components/ai-insights/FinancialAnalysisSection";
import { CriticalStockSection } from "@/components/ai-insights/CriticalStockSection";
import { OverstockSection } from "@/components/ai-insights/OverstockSection";
import { SmartSupplierRecommendations } from "@/components/ai-insights/SmartSupplierRecommendations";

export default function AiInsightsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("4 menit yang lalu");

  // Handle Refresh Data
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated("Baru saja");
      Swal.fire({
        icon: "success",
        title: "Data Diperbarui!",
        text: "Analisis AI dan wawasan stok terbaru berhasil dimuat.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }, 1200);
  };

  // Handle View Full P&L
  const handleViewPL = () => {
    Swal.fire({
      title: "Analisis Keuangan Lanjutan (P&L)",
      html: `
        <div className="text-left text-sm space-y-2 py-2">
          <p><strong>Margin Kotor:</strong> Rp42.850.000 (+14.2% YoY)</p>
          <p><strong>Biaya Pengadaan:</strong> Rp18.200.000</p>
          <p><strong>Biaya Penyimpanan:</strong> Rp2.100.000</p>
          <p><strong>Proyeksi ROI Efisiensi AI:</strong> +18% jika pengalihan anggaran suplemen disetujui.</p>
        </div>
      `,
      icon: "info",
      confirmButtonText: "Tutup",
      confirmButtonColor: "#2563EB",
    });
  };

  // Handle Reorder All Critical Items
  const handleReorderAllCritical = () => {
    Swal.fire({
      title: "Pesan Ulang 4 Item Kritis?",
      text: "Sistem akan membuat Purchase Order (PO) otomatis untuk Amoxicillin 500mg, Insulin Glargine, dan 2 item kritis lainnya.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Buat PO Otomatis",
      cancelButtonText: "Batal",
      confirmButtonColor: "#10B981",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "PO Berhasil Dibuat!",
          text: "Daftar PO telah dikirimkan ke modul Purchase Order.",
          icon: "success",
          confirmButtonColor: "#10B981",
        });
      }
    });
  };

  // Handle Reorder Single Item
  const handleReorderItem = (itemName: string) => {
    Swal.fire({
      title: `Pesan Ulang ${itemName}?`,
      text: `Buat order pengadaan cepat untuk ${itemName}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Proses Pemesanan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#10B981",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Berhasil!",
          text: `Pesanan untuk ${itemName} sedang diproses.`,
          icon: "success",
          confirmButtonColor: "#10B981",
        });
      }
    });
  };

  // Handle Apply Discount
  const handleApplyDiscount = (itemName: string) => {
    Swal.fire({
      title: `Terapkan Diskon 15%?`,
      text: `Menarik minat pembeli untuk mengurangi dead stock ${itemName}.`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Terapkan Diskon",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2563EB",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Diskon Diterapkan!",
          text: `Harga promo ${itemName} telah diperbarui di POS/Inventaris.`,
          icon: "success",
          confirmButtonColor: "#2563EB",
        });
      }
    });
  };

  // Handle Return to Supplier
  const handleReturnToSupplier = (itemName: string) => {
    Swal.fire({
      title: `Pengembalian ke Pemasok`,
      text: `Proses retur untuk kelebihan stok ${itemName}.`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Buat Pengajuan Retur",
      cancelButtonText: "Batal",
      confirmButtonColor: "#475569",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Retur Diajukan!",
          text: `Surat jalan pengembalian ${itemName} siap diproses.`,
          icon: "success",
          confirmButtonColor: "#475569",
        });
      }
    });
  };

  // Supplier Actions
  const handleReviewProposal = (supplierName: string) => {
    Swal.fire({
      title: `Proposal ${supplierName}`,
      text: `Diskrip penawaran: Diskon khusus bahan cold-chain dan fasilitas potongan harga hingga Rp450.000/bulan.`,
      icon: "info",
      confirmButtonText: "Terima Proposal",
      showCancelButton: true,
      cancelButtonText: "Tutup",
      confirmButtonColor: "#2563EB",
    });
  };

  const handleComparePrices = (supplierName: string) => {
    Swal.fire({
      title: `Perbandingan Harga - ${supplierName}`,
      text: `Generik Zyrtec ditawarkan dengan harga 30% lebih rendah dibanding supplier saat ini.`,
      icon: "info",
      confirmButtonText: "Lihat Tabel Komparasi",
      confirmButtonColor: "#10B981",
    });
  };

  const handleIntegrateSupplier = (supplierName: string) => {
    Swal.fire({
      title: `Integrasikan ${supplierName}?`,
      text: `Menambahkan ${supplierName} ke daftar pemasok resmi dengan opsi same-day delivery.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Integrasikan Pemasok",
      cancelButtonText: "Batal",
      confirmButtonColor: "#4F46E5",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Terintegrasi!",
          text: `${supplierName} berhasil ditambahkan ke daftar pemasok aktif.`,
          icon: "success",
          confirmButtonColor: "#4F46E5",
        });
      }
    });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header */}
      <AiInsightsHeader
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Row 1: Inventory Health & Financial Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InventoryHealthSection />
        </div>
        <div className="lg:col-span-1">
          <FinancialAnalysisSection onViewPL={handleViewPL} />
        </div>
      </div>

      {/* Row 2: Critical Stock & Overstock Optimization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CriticalStockSection
          onReorderAll={handleReorderAllCritical}
          onReorderItem={handleReorderItem}
        />
        <OverstockSection
          onApplyDiscount={handleApplyDiscount}
          onReturnToSupplier={handleReturnToSupplier}
        />
      </div>

      {/* Row 3: Smart Supplier Recommendations */}
      <SmartSupplierRecommendations
        onReviewProposal={handleReviewProposal}
        onComparePrices={handleComparePrices}
        onIntegrateSupplier={handleIntegrateSupplier}
      />

      {/* Footer Notice */}
      <div className="pt-2 text-center">
        <p className="text-xs text-slate-400 font-medium">
          Wawasan AI diperbarui {lastUpdated}. Algoritma v2.4.1 (disesuaikan untuk
          layanan kesehatan).
        </p>
      </div>
    </div>
  );
}
