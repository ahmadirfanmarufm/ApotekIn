"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Filter,
  Download,
  Printer,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { IncomingStockModal } from "@/components/inventory/IncomingStockModal";
import { StockReceiptDetailModal } from "@/components/inventory/StockReceiptDetailModal";
import type { StockReceiptListItem } from "@/types/stock-receipt";

const PAGE_SIZE = 10;

export default function IncomingStockPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receipts, setReceipts] = useState<StockReceiptListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailReceipt, setDetailReceipt] =
    useState<StockReceiptListItem | null>(null);

  const [periodFilter, setPeriodFilter] = useState("this-month");
  const [supplierFilter, setSupplierFilter] = useState("all");

  const loadReceipts = useCallback(async () => {
    try {
      const response = await fetch("/api/inventory/incoming", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal mengambil data stok masuk.");
      }

      setReceipts(data.data ?? []);
    } catch (error) {
      console.error("Failed to fetch stock receipts:", error);
      setReceipts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReceipts();
  }, [loadReceipts]);

  const supplierOptions = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const receipt of receipts) {
      map.set(receipt.supplier.id, receipt.supplier.name);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [receipts]);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const filteredReceipts = React.useMemo(() => {
    const now = new Date();

    return receipts.filter((receipt) => {
      if (periodFilter !== "all") {
        const receivedDate = new Date(receipt.receivedAt);

        switch (periodFilter) {
          case "today":
            if (!isSameDay(receivedDate, now)) return false;
            break;
          case "this-week": {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            if (receivedDate < startOfWeek || receivedDate > now) return false;
            break;
          }
          case "this-month":
            if (
              receivedDate.getMonth() !== now.getMonth() ||
              receivedDate.getFullYear() !== now.getFullYear()
            )
              return false;
            break;
          case "this-year":
            if (receivedDate.getFullYear() !== now.getFullYear()) return false;
            break;
        }
      }

      if (supplierFilter !== "all" && receipt.supplier.id !== supplierFilter) {
        return false;
      }

      return true;
    });
  }, [receipts, periodFilter, supplierFilter]);

  const totalTransactions = filteredReceipts.length;
  const totalValue = filteredReceipts.reduce(
    (acc, receipt) =>
      acc +
      receipt.items.reduce(
        (itemAcc, item) =>
          itemAcc + Number(item.quantity) * Number(item.unitPrice ?? 0),
        0,
      ),
    0,
  );

  const formatDate = (value: Date | string) =>
    new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReceipts.length / PAGE_SIZE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedReceipts = filteredReceipts.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const start = Math.max(1, safeCurrentPage - 1);
    const end = Math.min(totalPages, start + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stok Masuk</h1>
          <p className="text-slate-500 mt-1">
            Pencatatan penerimaan obat & registrasi batch baru dari supplier.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Tambah Stok Masuk
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm">
          <p className="text-sm font-semibold text-slate-600 mb-2">
            Total Transaksi Masuk Bulan Ini
          </p>
          <h2 className="text-2xl font-bold text-slate-900">
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              `${totalTransactions} Transaksi`
            )}
          </h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm">
          <p className="text-sm font-semibold text-slate-600 mb-2">
            Nilai Pembelian (Rp)
          </p>
          <h2 className="text-2xl font-bold text-slate-900">
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              `Rp${totalValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")},-`
            )}
          </h2>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter:
          </span>
          <select
            value={periodFilter}
            onChange={(e) => {
              setPeriodFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-37.5 cursor-pointer"
          >
            <option value="today">Hari Ini</option>
            <option value="this-week">Minggu Ini</option>
            <option value="this-month">Bulan Ini</option>
            <option value="this-year">Tahun Ini</option>
            <option value="all">Semua Periode</option>
          </select>
          <select
            value={supplierFilter}
            onChange={(e) => {
              setSupplierFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-37.5 cursor-pointer"
          >
            <option value="all">Semua Supplier</option>
            {supplierOptions.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
            <Download className="h-5 w-5" />
          </button>
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
            <Printer className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-xs font-bold text-slate-600">
              <th className="px-5 py-3.5 text-center">Tanggal Masuk</th>
              <th className="px-5 py-3.5">No. Faktur</th>
              <th className="px-5 py-3.5">No. PO Referensi</th>
              <th className="px-5 py-3.5">Supplier</th>
              <th className="px-5 py-3.5 text-center">Total Item</th>
              <th className="px-5 py-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredReceipts.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} className="p-5 text-center text-slate-500">
                  {receipts.length === 0
                    ? "Tidak ada data stok masuk."
                    : "Tidak ada transaksi yang cocok dengan filter."}
                </td>
              </tr>
            )}
            {isLoading && (
              <tr>
                <td colSpan={6} className="p-5 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto" />
                </td>
              </tr>
            )}
            {paginatedReceipts.map((row) => (
              <tr
                key={row.id}
                className="text-sm text-slate-700 hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-5 py-3 text-center whitespace-nowrap">
                  {formatDate(row.receivedAt)}
                </td>
                <td className="px-5 py-3 font-medium">
                  {row.invoiceNumber || row.receiptNumber}
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {row.purchaseOrder?.poNumber ?? "-"}
                </td>
                <td className="px-5 py-3 font-bold text-slate-900">
                  {row.supplier.name}
                </td>
                <td className="px-5 py-3 text-center font-bold text-emerald-500">
                  +{row.items.reduce((acc, item) => acc + item.quantity, 0)}
                </td>
                <td className="px-5 py-3 text-center flex justify-center">
                  <button
                    onClick={() => setDetailReceipt(row)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors border cursor-pointer border-emerald-200"
                  >
                    <Eye className="h-3.5 w-3.5" /> Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500 font-medium">
          <p>
            {totalTransactions === 0
              ? "Menampilkan 0 transaksi"
              : `Menampilkan ${(safeCurrentPage - 1) * PAGE_SIZE + 1}-${Math.min(safeCurrentPage * PAGE_SIZE, totalTransactions)} dari ${totalTransactions} transaksi`}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
              disabled={safeCurrentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 flex items-center justify-center rounded font-bold transition-colors ${
                  page === safeCurrentPage
                    ? "bg-emerald-500 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
              disabled={safeCurrentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <IncomingStockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadReceipts}
      />

      <StockReceiptDetailModal
        isOpen={detailReceipt !== null}
        receipt={detailReceipt}
        onClose={() => setDetailReceipt(null)}
      />
    </div>
  );
}
