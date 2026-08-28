"use client";

import { useEffect, useState } from "react";
import {
  X,
  Loader2,
  Package,
  FileText,
  Building2,
  CalendarDays,
  Printer,
  Truck,
} from "lucide-react";
import type { PurchaseOrderDetail, POStatusUI } from "@/types/purchase-order";
import { streamPurchaseOrderPDF } from "./streamSP";

interface PODetailModalProps {
  isOpen: boolean;
  poId: string | null;
  onClose: () => void;
}

const STATUS_LABEL: Record<POStatusUI, string> = {
  PENDING: "Pending",
  PARTIAL: "Sebagian",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const STATUS_BADGE_CLASS: Record<POStatusUI, string> = {
  PENDING: "bg-orange-50 text-orange-600 border-orange-200",
  PARTIAL: "bg-blue-50 text-blue-600 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

export function PODetailModal({ isOpen, poId, onClose }: PODetailModalProps) {
  const [detail, setDetail] = useState<PurchaseOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrintSP = async () => {
    if (!detail) return;

    setIsPrinting(true);
    try {
      await streamPurchaseOrderPDF(detail);
    } catch (err) {
      console.error("Failed to generate SP PDF:", err);
      setError(
        err instanceof Error
          ? `Gagal mencetak Surat Pesanan: ${err.message}`
          : "Gagal mencetak Surat Pesanan.",
      );
    } finally {
      setIsPrinting(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !poId) return;

    const loadDetail = async () => {
      setIsLoading(true);
      setError(null);
      setDetail(null);

      try {
        const response = await fetch(`/api/purchase-order/${poId}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Gagal mengambil detail purchase order.",
          );
        }

        setDetail(data.data as PurchaseOrderDetail);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil detail purchase order.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadDetail();
  }, [isOpen, poId]);

  if (!isOpen) return null;

  const formatCurrency = (value: number | string) =>
    `Rp${Number(value)
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")},-`;

  const formatDate = (value: Date | string) =>
    new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-900 truncate">
              {isLoading || !detail
                ? "Detail Purchase Order"
                : `${detail.poNumber} - ${detail.supplier.name}`}
            </h2>
            {detail && (
              <span
                className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_BADGE_CLASS[detail.status]}`}
              >
                {STATUS_LABEL[detail.status] ?? detail.status}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0 ml-4"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center gap-2 py-16 text-sm text-slate-500">
              <Loader2 className="animate-spin h-5 w-5 text-emerald-500" />
              Memuat detail purchase order...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : detail ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> No. PO
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {detail.poNumber}
                  </p>
                </div>
                <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" /> Tanggal PO
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {formatDate(detail.createdAt)}
                  </p>
                </div>
                <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5" /> Estimasi Datang
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {detail.expectedDeliveryAt
                      ? formatDate(detail.expectedDeliveryAt)
                      : "-"}
                  </p>
                </div>
                <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Supplier
                  </p>
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {detail.supplier.name}
                  </p>
                </div>
                <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" /> Total Nilai
                  </p>
                  <p className="text-sm font-bold text-slate-900 whitespace-nowrap">
                    {formatCurrency(detail.totalAmount)}
                  </p>
                </div>
              </div>

              {detail && (
                <div className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-700">
                      Progress Penerimaan
                    </p>

                    <p className="text-sm font-bold text-slate-900">
                      {detail.items.reduce(
                        (total, item) => total + item.receivedQty,
                        0,
                      )}{" "}
                      /{" "}
                      {detail.items.reduce(
                        (total, item) => total + item.orderedQty,
                        0,
                      )}{" "}
                      unit
                    </p>
                  </div>

                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{
                        width: `${(() => {
                          const ordered = detail.items.reduce(
                            (total, item) => total + item.orderedQty,
                            0,
                          );

                          const received = detail.items.reduce(
                            (total, item) => total + item.receivedQty,
                            0,
                          );

                          return ordered > 0
                            ? Math.min((received / ordered) * 100, 100)
                            : 0;
                        })()}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-bold text-slate-900 mb-3">
                  Daftar Barang Diorder ({detail.items.length} Item)
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-600">
                      <tr>
                        <th className="px-4 py-3">Kode</th>
                        <th className="px-4 py-3">Nama Barang</th>
                        <th className="px-4 py-3 text-center">Qty Order</th>
                        <th className="px-4 py-3 text-center">Diterima</th>
                        <th className="px-4 py-3 text-center">Sisa</th>
                        <th className="px-4 py-3 text-right">Harga Satuan</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {detail.items.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="p-8 text-center text-sm text-slate-400"
                          >
                            Tidak ada item pada purchase order ini.
                          </td>
                        </tr>
                      ) : (
                        detail.items.map((item) => (
                          <tr key={item.id} className="text-sm text-slate-700">
                            <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                              {item.item.code}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900">
                              {item.item.name}
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                                {item.orderedQty} {item.item.unit}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-lg font-bold text-xs border ${
                                  item.receivedQty >= item.orderedQty
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    : item.receivedQty > 0
                                      ? "bg-blue-50 text-blue-600 border-blue-100"
                                      : "bg-slate-50 text-slate-400 border-slate-200"
                                }`}
                              >
                                {item.receivedQty} {item.item.unit}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-lg font-bold text-xs border ${
                                  item.remainingQty === 0
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    : item.receivedQty > 0
                                      ? "bg-orange-50 text-orange-600 border-orange-100"
                                      : "bg-slate-50 text-slate-400 border-slate-200"
                                }`}
                              >
                                {item.remainingQty} {item.item.unit}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900 whitespace-nowrap">
                              {formatCurrency(
                                item.orderedQty * Number(item.unitPrice ?? 0),
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {detail.items.length > 0 && (
                      <tfoot className="bg-slate-50 border-t border-slate-200">
                        <tr className="text-sm font-bold text-slate-900">
                          <td colSpan={3} className="px-4 py-3">
                            Total
                          </td>
                          <td className="px-4 py-3 text-center"></td>
                          <td className="px-4 py-3" />
                          <td className="px-4 py-3" />
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            {formatCurrency(detail.totalAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              {detail.notes && (
                <div className="border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-500 mb-4">
                    Catatan
                  </p>
                  <p className="text-sm font-medium text-slate-700 whitespace-pre-line">
                    {detail.notes}
                  </p>
                </div>
              )}
            </>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center gap-3 bg-white">
          <button
            onClick={handlePrintSP}
            disabled={!detail || isPrinting}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPrinting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Menyiapkan PDF...
              </>
            ) : (
              <>
                <Printer className="h-4 w-4" /> Cetak SP
              </>
            )}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
