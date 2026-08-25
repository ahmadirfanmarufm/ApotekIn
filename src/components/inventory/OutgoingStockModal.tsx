"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, Trash2, Plus, Loader2, AlertTriangle } from "lucide-react";
import type { StockOutBatchOption } from "@/types/stock-out";

interface OutgoingStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface StockOutItemForm {
  key: number;
  batchId: string;
  quantity: string;
}

const REASON_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "SALE", label: "Penjualan" },
  { value: "EXPIRED", label: "Kedaluwarsa (Expired)" },
  { value: "DAMAGED", label: "Rusak" },
  { value: "REFUND", label: "Refund" },
  { value: "RETURN_TO_SUPPLIER", label: "Retur ke Supplier" },
  { value: "OTHER", label: "Lainnya" },
];

export function OutgoingStockModal(props: OutgoingStockModalProps) {
  if (!props.isOpen) return null;

  return <OutgoingStockModalContent {...props} />;
}

function OutgoingStockModalContent({
  onClose,
  onSuccess,
}: OutgoingStockModalProps) {
  const [batches, setBatches] = useState<StockOutBatchOption[]>([]);
  const [reason, setReason] = useState("SALE");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<StockOutItemForm[]>([
    { key: 1, batchId: "", quantity: "" },
  ]);
  const [nextKey, setNextKey] = useState(2);

  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBatches = async () => {
      setIsLoadingBatches(true);

      try {
        const response = await fetch("/api/inventory/outgoing/batches", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Gagal mengambil daftar batch.");
        }

        setBatches(data.data ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Gagal mengambil daftar batch.",
        );
      } finally {
        setIsLoadingBatches(false);
      }
    };

    void loadBatches();
  }, []);

  const selectedQtyByBatch = useMemo(() => {
    const map = new Map<string, number>();

    for (const item of items) {
      if (!item.batchId) continue;

      const qty = Number(item.quantity) || 0;
      map.set(item.batchId, (map.get(item.batchId) ?? 0) + qty);
    }

    return map;
  }, [items]);

  const getBatchById = (batchId: string) =>
    batches.find((batch) => batch.id === batchId);

  const estimatedTotal = items.reduce((acc, item) => {
    const batch = getBatchById(item.batchId);

    if (!batch) return acc;

    return acc + (Number(item.quantity) || 0) * Number(batch.sellPrice);
  }, 0);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { key: nextKey, batchId: "", quantity: "" }]);
    setNextKey((prev) => prev + 1);
  };

  const handleRemoveItem = (key: number) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const handleItemChange = (
    key: number,
    field: keyof StockOutItemForm,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;

        if (field === "batchId") {
          const batch = batches.find((b) => b.id === value);

          return {
            ...item,
            batchId: value,
            quantity: batch ? String(batch.quantity) : "",
          };
        }

        return { ...item, [field]: value };
      }),
    );
  };

  const handleSave = async () => {
    setError(null);

    const validItems = items.filter(
      (item) => item.batchId && Number(item.quantity) > 0,
    );

    if (validItems.length === 0) {
      setError("Minimal harus ada 1 barang dengan jumlah lebih dari 0.");
      return;
    }

    for (const item of validItems) {
      const batch = getBatchById(item.batchId);

      if (!batch) continue;

      const requested = Number(item.quantity);

      if (requested > batch.quantity) {
        setError(
          `Jumlah untuk ${batch.item.name} (batch ${batch.batchNumber}) melebihi stok tersedia (sisa: ${batch.quantity}).`,
        );
        return;
      }
    }

    if (reason === "OTHER" && !notes.trim()) {
      setError("Catatan wajib diisi ketika alasan adalah 'Lainnya'.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/inventory/outgoing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason,
          notes: notes.trim() || undefined,
          items: validItems.map((item) => ({
            batchId: item.batchId,
            quantity: Number(item.quantity),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal menyimpan stok keluar.");
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan stok keluar.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Form Pengeluaran Stok
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Catat pengurangan stok beserta alasannya agar riwayat transparan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto">
          <div className="grid grid-cols-3 gap-6 p-5 border border-slate-200 rounded-xl bg-slate-50/50">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">
                Alasan Pengeluaran <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {REASON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-600">
                Keterangan{" "}
                {reason === "OTHER" && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  reason === "SALE"
                    ? "Contoh: Penjualan resep dokter Racikan #12"
                    : reason === "EXPIRED"
                      ? "Contoh: BCH-PCM-202501 kedaluwarsa sejak 15/08/2026"
                      : reason === "DAMAGED"
                        ? "Contoh: 2 botol pecah saat penataan rak"
                        : reason === "REFUND"
                          ? "Contoh: Refund pesanan online #INV-88"
                          : reason === "RETURN_TO_SUPPLIER"
                            ? "Contoh: Retur ke PT Kimia Farma surat jalan SJ-77"
                            : "Wajib diisi untuk alasan 'Lainnya'"
                }
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Daftar Barang Keluar</h3>
              <button
                onClick={handleAddItem}
                className="text-emerald-600 text-sm font-semibold hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Tambah Item
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-600">
                  <tr>
                    <th className="p-4 w-2/5">Barang / Batch</th>
                    <th className="p-4">Exp Date</th>
                    <th className="p-4 w-44">Qty Keluar</th>
                    <th className="p-4 w-36 text-right">Subtotal</th>
                    <th className="p-4 text-center w-16">#</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingBatches ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center">
                        <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Memuat daftar batch...
                        </span>
                      </td>
                    </tr>
                  ) : batches.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-8 text-center text-sm text-slate-400"
                      >
                        Tidak ada batch dengan stok tersedia.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const batch = getBatchById(item.batchId);
                      const otherRowsQty =
                        selectedQtyByBatch.get(item.batchId ?? "") ?? 0;
                      const thisRowQty = Number(item.quantity) || 0;
                      const availableForThisRow =
                        (batch?.quantity ?? 0) - otherRowsQty + thisRowQty;
                      const isOver =
                        Boolean(batch) && thisRowQty > availableForThisRow;

                      return (
                        <tr key={item.key} className="bg-white">
                          <td className="p-4">
                            <select
                              value={item.batchId}
                              onChange={(e) =>
                                handleItemChange(
                                  item.key,
                                  "batchId",
                                  e.target.value,
                                )
                              }
                              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="">-- Pilih Barang --</option>
                              {batches.map((b) => {
                                const reservedElsewhere =
                                  selectedQtyByBatch.get(b.id) ?? 0;
                                const remaining =
                                  b.quantity -
                                  reservedElsewhere +
                                  (item.batchId === b.id
                                    ? Number(item.quantity) || 0
                                    : 0);

                                if (remaining <= 0 && item.batchId !== b.id) {
                                  return null;
                                }

                                return (
                                  <option key={b.id} value={b.id}>
                                    {b.item.name} ({b.item.code}) · Batch{" "}
                                    {b.batchNumber} · Sisa {remaining}{" "}
                                    {b.item.unit}
                                  </option>
                                );
                              })}
                            </select>
                            {isOver && (
                              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Melebihi stok tersedia ({availableForThisRow})
                              </p>
                            )}
                          </td>
                          <td className="p-4 whitespace-nowrap text-sm text-slate-700">
                            {batch
                              ? new Date(batch.expiryDate).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  },
                                )
                              : "-"}
                          </td>
                          <td className="p-4">
                            <div className="flex shadow-sm rounded-lg">
                              <input
                                type="number"
                                min={1}
                                max={availableForThisRow || undefined}
                                placeholder="0"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleItemChange(
                                    item.key,
                                    "quantity",
                                    e.target.value,
                                  )
                                }
                                disabled={!item.batchId}
                                className="w-full border border-slate-200 rounded-l-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 z-10 disabled:bg-slate-50 disabled:text-slate-400"
                              />
                              <span className="bg-slate-50 border-y border-r border-slate-200 text-slate-500 text-sm px-3 py-2.5 rounded-r-lg whitespace-nowrap">
                                {batch?.item.unit || "-"}
                              </span>
                            </div>
                            {batch && (
                              <p className="text-[11px] text-slate-400 mt-1">
                                Stok tersedia: {batch.quantity}{" "}
                                {batch.item.unit}
                              </p>
                            )}
                          </td>
                          <td className="p-4 text-right text-sm font-semibold text-slate-700 whitespace-nowrap">
                            Rp
                            {(
                              (Number(item.quantity) || 0) *
                              Number(batch?.sellPrice ?? 0)
                            ).toLocaleString("id-ID")}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleRemoveItem(item.key)}
                              disabled={items.length === 1}
                              className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4 pr-2">
              <p className="text-xs text-slate-400">
                Urutan batch mengikuti FEFO (First Expired First Out).
              </p>
              <div className="text-sm font-bold text-slate-900">
                Estimasi Total Nilai:{" "}
                <span className="text-emerald-600">
                  Rp{estimatedTotal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-end items-center gap-3 bg-white">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 w-full sm:w-auto sm:flex-1">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors w-full cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || isLoadingBatches}
              className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors w-48 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-5 w-5" />
                  Menyimpan...
                </span>
              ) : (
                "Simpan Stok Keluar"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
