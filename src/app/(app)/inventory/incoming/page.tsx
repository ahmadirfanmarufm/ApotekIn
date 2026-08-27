"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Plus,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { useSearchParams, useRouter } from "next/navigation";

import { IncomingStockModal } from "@/components/inventory/IncomingStockModal";
import { StockReceiptDetailModal } from "@/components/inventory/StockReceiptDetailModal";
import type { StockReceiptListItem } from "@/types/stock-receipt";

const PAGE_SIZE = 10;

export default function IncomingStockPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receipts, setReceipts] = useState<StockReceiptListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailReceipt, setDetailReceipt] =
    useState<StockReceiptListItem | null>(null);

  const [periodFilter, setPeriodFilter] = useState("this-month");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>(
    [],
  );

  useEffect(() => {
    let isMounted = true;

    const loadSuppliers = async () => {
      try {
        const response = await fetch("/api/supplier", {
          cache: "no-store",
        });
        const data = await response.json();

        if (isMounted && data.success) {
          setSuppliers(data.data ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch suppliers:", error);
      }
    };

    void loadSuppliers();

    return () => {
      isMounted = false;
    };
  }, []);

  const itemId = searchParams.get("itemId");
  const quantityParam = searchParams.get("quantity");
  const mode = searchParams.get("mode");

  const restockQuantity = quantityParam ? Number(quantityParam) : null;

  const isRestockMode = mode === "restock" && Boolean(itemId);

  const loadReceipts = useCallback(async () => {
    try {
      setIsLoading(true);

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

  /*
   * ============================================================
   * AUTO OPEN RESTOCK MODAL
   * ============================================================
   */

  useEffect(() => {
    if (!isRestockMode) {
      return;
    }

    setIsModalOpen(true);
  }, [isRestockMode]);

  /*
   * ============================================================
   * CLOSE RESTOCK MODE
   * ============================================================
   */

  const handleCloseModal = () => {
    setIsModalOpen(false);

    /*
     * Jika datang dari tombol Restock,
     * bersihkan query setelah modal ditutup.
     *
     * Contoh:
     *
     * /inventory/incoming?itemId=xxx&quantity=20&mode=restock
     *
     * menjadi:
     *
     * /inventory/incoming
     */

    if (isRestockMode) {
      router.replace("/inventory/incoming");
    }
  };

  /*
   * ============================================================
   * FILTERING
   * ============================================================
   */

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const filteredReceipts = useMemo(() => {
    const now = new Date();

    return receipts.filter((receipt) => {
      const receiptDate = new Date(receipt.receivedAt);

      if (periodFilter !== "all") {
        switch (periodFilter) {
          case "today":
            if (!isSameDay(receiptDate, now)) return false;
            break;
          case "this-week": {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            if (receiptDate < startOfWeek || receiptDate > now) return false;
            break;
          }
          case "this-month":
            if (
              receiptDate.getMonth() !== now.getMonth() ||
              receiptDate.getFullYear() !== now.getFullYear()
            )
              return false;
            break;
          case "this-year":
            if (receiptDate.getFullYear() !== now.getFullYear()) return false;
            break;
        }
      }

      if (supplierFilter !== "all" && receipt.supplier.id !== supplierFilter) {
        return false;
      }

      return true;
    });
  }, [receipts, periodFilter, supplierFilter]);

  /*
   * ============================================================
   * STATISTICS
   * ============================================================
   */

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

  /*
   * ============================================================
   * DATE FORMAT
   * ============================================================
   */

  const formatDate = (value: Date | string) =>
    new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  /*
   * ============================================================
   * PAGINATION
   * ============================================================
   */

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

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="relative space-y-6">
      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stok Masuk</h1>

          <p className="mt-1 text-sm text-slate-500">
            Pencatatan penerimaan obat & registrasi batch baru dari supplier.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
        >
          <Plus className="h-5 w-5" />
          Tambah Stok Masuk
        </button>
      </div>

      {/* RESTOCK INFO */}

      {isRestockMode && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-700">Mode Restock</p>

          <p className="mt-1 text-xs text-emerald-600">
            Sistem akan membantu mengisi penerimaan untuk item yang dipilih.
          </p>

          {restockQuantity !== null && !Number.isNaN(restockQuantity) && (
            <p className="mt-1 text-xs text-emerald-600">
              Rekomendasi jumlah restock:{" "}
              <strong>{restockQuantity.toLocaleString("id-ID")}</strong>
            </p>
          )}
        </div>
      )}

      {/* STATISTICS */}

      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-slate-600">
            Total Transaksi Masuk
          </p>

          <h2 className="text-2xl font-bold text-slate-900">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              `${totalTransactions} Transaksi`
            )}
          </h2>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-slate-600">
            Nilai Pembelian (Rp)
          </p>

          <h2 className="text-2xl font-bold text-slate-900">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              `Rp${totalValue
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".")},-`
            )}
          </h2>
        </div>
      </div>

      {/* FILTER */}

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Filter className="h-4 w-4" />
            Filter:
          </span>

          <select
            value={periodFilter}
            onChange={(e) => {
              setPeriodFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="min-w-37.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
            className="min-w-37.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Supplier</option>

            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
          ></button>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
          ></button>
        </div>
      </div>

      {/* TABLE */}

      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
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
            {receipts.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} className="p-5 text-center text-slate-500">
                  Tidak ada data stok masuk.
                </td>
              </tr>
            )}

            {isLoading && (
              <tr>
                <td colSpan={6} className="p-5 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-500" />
                </td>
              </tr>
            )}

            {paginatedReceipts.map((row) => (
              <tr
                key={row.id}
                className="text-sm text-slate-700 transition-colors hover:bg-slate-50/50"
              >
                <td className="whitespace-nowrap px-5 py-3 text-center">
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

                <td className="flex justify-center px-5 py-3 text-center">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-100"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-5 py-3.5 text-xs font-medium text-slate-500">
          <p>
            {totalTransactions === 0
              ? "Menampilkan 0 transaksi"
              : `Menampilkan ${
                  (safeCurrentPage - 1) * PAGE_SIZE + 1
                }-${Math.min(
                  safeCurrentPage * PAGE_SIZE,
                  totalTransactions,
                )} dari ${totalTransactions} transaksi`}
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
              disabled={safeCurrentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {getPageNumbers().map((page) => (
              <button
                type="button"
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-7 w-7 items-center justify-center rounded font-bold transition-colors ${
                  page === safeCurrentPage
                    ? "bg-emerald-500 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
              disabled={safeCurrentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          INCOMING STOCK MODAL
          ======================================================== */}

      <IncomingStockModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={loadReceipts}
        restockItemId={isRestockMode ? itemId : null}
        restockQuantity={
          isRestockMode &&
          restockQuantity !== null &&
          !Number.isNaN(restockQuantity)
            ? restockQuantity
            : null
        }
      />
    </div>
  );
}
