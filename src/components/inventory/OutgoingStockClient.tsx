"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { OutgoingStockModal } from "@/components/inventory/OutgoingStockModal";
import { StockOutDetailModal } from "@/components/inventory/StockOutDetailModal";
import {
  STOCK_OUT_REASON_LABEL,
  type StockOutListItem,
  type StockOutReasonUI,
} from "@/types/stock-out";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserPermissions } from "@/lib/permission";

const PAGE_SIZE = 10;

const REASON_BADGE_CLASS: Record<StockOutReasonUI, string> = {
  SALE: "bg-emerald-50 text-emerald-600 border-emerald-200",
  EXPIRED: "bg-orange-50 text-orange-600 border-orange-200",
  DAMAGED: "bg-red-50 text-red-600 border-red-200",
  REFUND: "bg-blue-50 text-blue-600 border-blue-200",
  RETURN_TO_SUPPLIER: "bg-purple-50 text-purple-600 border-purple-200",
  OTHER: "bg-slate-100 text-slate-600 border-slate-200",
};

export default async function OutgoingStockClient() {
  const session = await auth();
  
  if (!session?.user?.id || !session.user.role) {
      redirect("/login");
  }

  const permissions = await getUserPermissions(session.user.id, session.user.role);

  if (!permissions.includes("inventory.view")) {
      redirect("/not-permission");
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stockOuts, setStockOuts] = useState<StockOutListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailStockOut, setDetailStockOut] = useState<StockOutListItem | null>(
    null,
  );

  const [periodFilter, setPeriodFilter] = useState("this-month");
  const [reasonFilter, setReasonFilter] = useState("all");

  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadStockOuts = async () => {
      try {
        const response = await fetch("/api/inventory/outgoing", {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Gagal mengambil data stok keluar.");
        }

        setStockOuts(data.data ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Failed to fetch stock outs:", error);
        setStockOuts([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadStockOuts();

    return () => {
      controller.abort();
    };
  }, [refreshKey]);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const filteredStockOuts = React.useMemo(() => {
    const now = new Date();

    return stockOuts.filter((stockOut) => {
      if (periodFilter !== "all") {
        const outDate = new Date(stockOut.createdAt);

        switch (periodFilter) {
          case "today":
            if (!isSameDay(outDate, now)) return false;
            break;
          case "this-week": {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            if (outDate < startOfWeek || outDate > now) return false;
            break;
          }
          case "this-month":
            if (
              outDate.getMonth() !== now.getMonth() ||
              outDate.getFullYear() !== now.getFullYear()
            )
              return false;
            break;
          case "this-year":
            if (outDate.getFullYear() !== now.getFullYear()) return false;
            break;
        }
      }

      if (reasonFilter !== "all" && stockOut.reason !== reasonFilter) {
        return false;
      }

      return true;
    });
  }, [stockOuts, periodFilter, reasonFilter]);

  const totalTransactions = filteredStockOuts.length;

  const totalUnits = filteredStockOuts.reduce(
    (acc, stockOut) =>
      acc +
      stockOut.items.reduce((itemAcc, item) => itemAcc + item.quantity, 0),
    0,
  );

  const totalValue = filteredStockOuts.reduce(
    (acc, stockOut) =>
      acc +
      stockOut.items.reduce(
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

  const formatCurrency = (value: number) =>
    `Rp${value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")},-`;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStockOuts.length / PAGE_SIZE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedStockOuts = filteredStockOuts.slice(
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
          <h1 className="text-2xl font-bold text-slate-900">Stok Keluar</h1>
          <p className="text-slate-500 mt-1">Riwayat pengurangan stok</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Catat Stok Keluar
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm">
          <p className="text-sm font-semibold text-slate-600 mb-2">
            Total Transaksi Keluar
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
            Total Unit Keluar
          </p>
          <h2 className="text-2xl font-bold text-slate-900">
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              `${totalUnits} Unit`
            )}
          </h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm">
          <p className="text-sm font-semibold text-slate-600 mb-2">
            Total Nilai Pengeluaran (Rp)
          </p>
          <h2 className="text-2xl font-bold text-slate-900">
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              formatCurrency(totalValue)
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
            value={reasonFilter}
            onChange={(e) => {
              setReasonFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-37.5 cursor-pointer"
          >
            <option value="all">Semua Alasan</option>
            {Object.entries(STOCK_OUT_REASON_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-xs font-bold text-slate-600">
              <th className="px-5 py-3.5 text-center">Tanggal Keluar</th>
              <th className="px-5 py-3.5">No. Referensi</th>
              <th className="px-5 py-3.5">Alasan</th>
              <th className="px-5 py-3.5">Dicatat Oleh</th>
              <th className="px-5 py-3.5 text-center">Total Item</th>
              <th className="px-5 py-3.5 text-right">Nilai</th>
              <th className="px-5 py-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStockOuts.length === 0 && !isLoading && (
              <tr>
                <td colSpan={7} className="p-5 text-center text-slate-500">
                  {stockOuts.length === 0
                    ? "Tidak ada data stok keluar."
                    : "Tidak ada transaksi yang cocok dengan filter."}
                </td>
              </tr>
            )}
            {isLoading && (
              <tr>
                <td colSpan={7} className="p-5 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto" />
                </td>
              </tr>
            )}
            {paginatedStockOuts.map((row) => {
              const totalQty = row.items.reduce(
                (acc, item) => acc + item.quantity,
                0,
              );
              const rowValue = row.items.reduce(
                (acc, item) =>
                  acc + Number(item.quantity) * Number(item.unitPrice ?? 0),
                0,
              );

              return (
                <tr
                  key={row.id}
                  className="text-sm text-slate-700 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-5 py-3 text-center whitespace-nowrap">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="px-5 py-3 font-medium">{row.referenceNo}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${REASON_BADGE_CLASS[row.reason]}`}
                    >
                      {STOCK_OUT_REASON_LABEL[row.reason] ?? row.reason}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {row.createdBy.fullName}
                  </td>
                  <td className="px-5 py-3 text-center font-bold text-red-500">
                    -{totalQty} {row.items[0]?.batch.item.unit ?? "Unit"}
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    {formatCurrency(rowValue)}
                  </td>
                  <td className="px-5 py-3 text-center flex justify-center">
                    <button
                      onClick={() => setDetailStockOut(row)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors border cursor-pointer border-red-200"
                    >
                      <Eye className="h-3.5 w-3.5" /> Detail
                    </button>
                  </td>
                </tr>
              );
            })}
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
              className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              disabled={safeCurrentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 flex items-center justify-center rounded font-bold transition-colors cursor-pointer ${
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
              className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              disabled={safeCurrentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <OutgoingStockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refresh}
      />

      <StockOutDetailModal
        isOpen={detailStockOut !== null}
        stockOut={detailStockOut}
        onClose={() => setDetailStockOut(null)}
      />
    </div>
  );
}
