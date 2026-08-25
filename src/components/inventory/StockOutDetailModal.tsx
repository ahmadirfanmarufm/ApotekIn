"use client";

import React from "react";
import { X, Package, FileText, CalendarDays, User, Tag } from "lucide-react";
import {
  STOCK_OUT_REASON_LABEL,
  type StockOutListItem,
  type StockOutReasonUI,
} from "@/types/stock-out";

interface StockOutDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockOut: StockOutListItem | null;
}

const REASON_BADGE_CLASS: Record<StockOutReasonUI, string> = {
  SALE: "bg-emerald-50 text-emerald-600 border-emerald-200",
  EXPIRED: "bg-orange-50 text-orange-600 border-orange-200",
  DAMAGED: "bg-red-50 text-red-600 border-red-200",
  REFUND: "bg-blue-50 text-blue-600 border-blue-200",
  RETURN_TO_SUPPLIER: "bg-purple-50 text-purple-600 border-purple-200",
  OTHER: "bg-slate-100 text-slate-600 border-slate-200",
};

export function StockOutDetailModal({
  isOpen,
  onClose,
  stockOut,
}: StockOutDetailModalProps) {
  if (!isOpen || !stockOut) return null;

  const formatDate = (value: Date | string) =>
    new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const formatCurrency = (value: number | string) => {
    const num = Number(value);
    return `Rp${num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")},-`;
  };

  const totalQuantity = stockOut.items.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  const totalValue = stockOut.items.reduce(
    (acc, item) => acc + item.quantity * Number(item.unitPrice ?? 0),
    0,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Detail Stok Keluar
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {stockOut.referenceNo}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> No. Referensi
              </p>
              <p className="text-sm font-bold text-slate-900">
                {stockOut.referenceNo}
              </p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> Tanggal Keluar
              </p>
              <p className="text-sm font-bold text-slate-900">
                {formatDate(stockOut.createdAt)}
              </p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Alasan
              </p>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${REASON_BADGE_CLASS[stockOut.reason]}`}
              >
                {STOCK_OUT_REASON_LABEL[stockOut.reason] ?? stockOut.reason}
              </span>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Dicatat Oleh
              </p>
              <p className="text-sm font-bold text-slate-900 truncate">
                {stockOut.createdBy.fullName}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-slate-400" />
              Daftar Barang Keluar ({stockOut.items.length} Item ·{" "}
              {totalQuantity} Unit)
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Kode</th>
                    <th className="px-4 py-3">Nama Barang</th>
                    <th className="px-4 py-3">No. Batch</th>
                    <th className="px-4 py-3">Exp Date</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Harga Satuan</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockOut.items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-8 text-center text-sm text-slate-400"
                      >
                        Tidak ada item pada transaksi ini.
                      </td>
                    </tr>
                  ) : (
                    stockOut.items.map((item) => (
                      <tr key={item.id} className="text-sm text-slate-700">
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {item.batch.item.code}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {item.batch.item.name}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {item.batch.batchNumber}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDate(item.batch.expiryDate)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-red-50 text-red-600 font-bold text-xs border border-red-100">
                            -{item.quantity} {item.batch.item.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900 whitespace-nowrap">
                          {formatCurrency(
                            item.quantity * Number(item.unitPrice ?? 0),
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {stockOut.items.length > 0 && (
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr className="text-sm font-bold text-slate-900">
                      <td colSpan={5} className="px-4 py-3">
                        Total
                      </td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {formatCurrency(totalValue)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">
              Keterangan
            </p>
            <p className="text-sm font-medium text-slate-700 whitespace-pre-line">
              {stockOut.notes || "-"}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end items-center gap-3 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
