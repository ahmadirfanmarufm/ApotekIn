"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Filter,
  Search,
  Printer,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { POModal } from "@/components/purchase-order/POModal";
import type { PurchaseOrderListItem } from "@/types/purchase-order";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  PARTIAL: "Sebagian",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const PAGE_SIZE = 10;

export default function PurchaseOrderPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderListItem[]>(
    [],
  );
  const [suppliers, setSuppliers] = useState<
    Array<{ id: string; code: string; name: string }>
  >([]);
  const [items, setItems] = useState<
    Array<{ id: string; code: string; name: string; unit: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadPurchaseOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (searchInput.trim()) params.set("search", searchInput.trim());
      params.set("page", currentPage.toString());
      params.set("pageSize", PAGE_SIZE.toString());

      const query = params.toString();

      const response = await fetch(
        query ? `/api/purchase-order?${query}` : "/api/purchase-order",
        { cache: "no-store" },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal mengambil data purchase order.");
      }

      setPurchaseOrders(data.data ?? []);
    } catch (error) {
      console.error("Failed to fetch purchase orders:", error);
      setPurchaseOrders([]);
    }
  }, [statusFilter, searchInput, currentPage]);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);

      try {
        const [supplierRes, itemRes] = await Promise.all([
          fetch("/api/supplier", { cache: "no-store" }),
          fetch("/api/inventory/items", { cache: "no-store" }),
        ]);

        const supplierJson = await supplierRes.json();
        const itemJson = await itemRes.json();

        if (supplierRes.ok && supplierJson.success) {
          setSuppliers(supplierJson.data ?? []);
        }

        if (itemRes.ok && itemJson.success) {
          setItems(itemJson.data ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadInitialData();
  }, []);

  useEffect(() => {
    void loadPurchaseOrders();
  }, [loadPurchaseOrders]);

  // Reset ke halaman 1 saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchInput]);

  const filteredOrders = purchaseOrders.filter((po) => {
    if (!searchInput.trim()) return true;

    const keyword = searchInput.trim().toLowerCase();

    return (
      po.poNumber.toLowerCase().includes(keyword) ||
      po.supplier.name.toLowerCase().includes(keyword)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice(
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
          <h1 className="text-2xl font-bold text-slate-900">
            Purchase Order (PO)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola dan buat Surat Pesanan obat ke Supplier/PBF
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          Buat PO Baru
        </button>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[150px]"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIAL">Sebagian</option>
            <option value="COMPLETED">Selesai</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari No. PO atau Supplier"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm w-80 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-xs font-bold text-slate-600">
              <th className="px-5 py-3.5 text-center">Tanggal PO</th>
              <th className="px-5 py-3.5">No. PO</th>
              <th className="px-5 py-3.5">Supplier</th>
              <th className="px-5 py-3.5 text-center">Jumlah Item</th>
              <th className="px-5 py-3.5 text-center">Status</th>
              <th className="px-5 py-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-5 text-center text-slate-500">
                  {isLoading ? (
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin h-5 w-5 text-emerald-500" />
                      Memuat data...
                    </div>
                  ) : (
                    "Tidak ada data purchase order."
                  )}
                </td>
              </tr>
            )}
            {paginatedOrders.map((po) => {
              const totalOrdered = po.items.reduce(
                (acc, item) => acc + item.quantity,
                0,
              );
              const totalReceived = po.items.reduce(
                (acc, item) => acc + item.receivedQty,
                0,
              );

              return (
                <tr
                  key={po.id}
                  className="text-sm text-slate-700 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-5 py-3 text-center whitespace-nowrap">
                    {new Intl.DateTimeFormat("id-ID").format(
                      new Date(po.createdAt),
                    )}
                  </td>
                  <td className="px-5 py-3 font-medium">{po.poNumber}</td>
                  <td className="px-5 py-3 font-bold text-slate-900">
                    {po.supplier.name}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {po.items.length} Item
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        po.status === "PENDING"
                          ? "bg-orange-50 text-orange-600 border-orange-200"
                          : po.status === "PARTIAL"
                            ? "bg-blue-50 text-blue-600 border-blue-200"
                            : po.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : "bg-red-50 text-red-600 border-red-200"
                      }`}
                    >
                      {STATUS_LABEL[po.status] ?? po.status}
                    </span>
                    {(po.status === "PARTIAL" || po.status === "COMPLETED") && (
                      <span className="block text-[11px] text-slate-400 mt-1">
                        {totalReceived}/{totalOrdered} diterima
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center flex justify-center">
                    <button
                      onClick={() =>
                        window.open(`/api/purchase-order/${po.id}`, "_blank")
                      }
                      className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      {po.status === "PENDING" || po.status === "PARTIAL" ? (
                        <>
                          <Printer className="h-4 w-4" /> Cetak SP
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" /> Detail
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500 font-medium">
          <p>
            {filteredOrders.length === 0
              ? "Menampilkan 0 PO"
              : `Menampilkan ${(safeCurrentPage - 1) * PAGE_SIZE + 1}-${Math.min(
                  safeCurrentPage * PAGE_SIZE,
                  filteredOrders.length,
                )} dari ${filteredOrders.length} PO`}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
              disabled={currentPage === 1}
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
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <POModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        suppliers={suppliers}
        items={items}
        onSuccess={loadPurchaseOrders}
      />
    </div>
  );
}
