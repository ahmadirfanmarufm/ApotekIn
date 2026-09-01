"use client";

import { useEffect, useState } from "react";
import { X, Trash2, Plus, Loader2 } from "lucide-react";
import type { PurchaseOrderSupplier } from "@/types/purchase-order";

interface POModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSupplierId?: string | null;
  suppliers: PurchaseOrderSupplier[];
  items: Array<{
    id: string;
    code: string;
    name: string;
    unit: string;
  }>;
  restockItemId?: string | null;
  restockQuantity?: number;
  onSuccess?: () => void | Promise<void>;
}

interface PoItemForm {
  key: number;
  itemId: string;
  quantity: string;
  unitPrice: string;
}

const emptyItem = (key: number): PoItemForm => ({
  key,
  itemId: "",
  quantity: "",
  unitPrice: "",
});

export function POModal({
  isOpen,
  onClose,
  initialSupplierId = null,
  suppliers,
  items,
  restockItemId = null,
  restockQuantity = 0,
  onSuccess,
}: POModalProps) {
  const [supplierId, setSupplierId] = useState("");
  const [notes, setNotes] = useState("");
  const [expectedDeliveryAt, setExpectedDeliveryAt] = useState("");
  const [poItems, setPoItems] = useState<PoItemForm[]>([emptyItem(1)]);
  const [nextKey, setNextKey] = useState(2);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setSupplierId(initialSupplierId || "");
    setNotes("");
    setExpectedDeliveryAt("");
    setError(null);
    setNextKey(2);

    if (restockItemId && restockQuantity > 0) {
      setPoItems([
        {
          key: 1,
          itemId: restockItemId,
          quantity: String(restockQuantity),
          unitPrice: "",
        },
      ]);
    } else {
      setPoItems([emptyItem(1)]);
    }
  }, [isOpen, initialSupplierId, restockItemId, restockQuantity]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setPoItems((prev) => [...prev, emptyItem(nextKey)]);
    setNextKey((prev) => prev + 1);
  };

  const handleRemoveItem = (key: number) => {
    setPoItems((prev) => prev.filter((item) => item.key !== key));
  };

  const handleItemChange = (
    key: number,
    field: keyof PoItemForm,
    value: string,
  ) => {
    setPoItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleSubmit = async () => {
    setError(null);

    if (!supplierId) {
      setError("Supplier wajib dipilih.");
      return;
    }

    if (expectedDeliveryAt) {
      const expected = new Date(expectedDeliveryAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (Number.isNaN(expected.getTime())) {
        setError("Format tanggal estimasi tidak valid.");
        return;
      }

      if (expected < today) {
        setError("Tanggal estimasi tidak boleh sebelum hari ini.");
        return;
      }
    }

    for (const item of poItems) {
      if (!item.itemId || !item.quantity) {
        setError("Lengkapi barang dan jumlah pesanan pada setiap baris.");
        return;
      }

      if (Number(item.quantity) <= 0) {
        setError("Jumlah pesanan harus lebih dari 0.");
        return;
      }

      if (!item.unitPrice) {
        setError("Harga satuan wajib diisi pada setiap barang.");
        return;
      }

      if (Number(item.unitPrice) < 0) {
        setError("Harga satuan tidak boleh kurang dari 0.");
        return;
      }
    }

    const itemIds = poItems.map((item) => item.itemId);

    if (new Set(itemIds).size !== itemIds.length) {
      setError("Barang yang sama tidak boleh dipilih lebih dari satu kali.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/purchase-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplierId,
          notes: notes.trim() || undefined,
          expectedDeliveryAt: expectedDeliveryAt
            ? new Date(expectedDeliveryAt).toISOString()
            : undefined,
          items: poItems.map((item) => ({
            itemId: item.itemId,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice || 0),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal membuat purchase order.");
      }

      onClose();
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat membuat purchase order.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        <div className="px-4 py-4 sm:px-6 border-b border-slate-200 flex justify-between items-center bg-white gap-3">
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-slate-900">
              Buat Purchase Order Baru
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              No. batch & tanggal kedaluwarsa diinput saat penerimaan barang
              (Stok Masuk).
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 overflow-y-auto">
          {restockItemId && restockQuantity > 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <p className="font-semibold">Restock Barang</p>
              <p className="mt-1">
                Barang dan jumlah pesanan telah diisi berdasarkan kebutuhan stok
                maksimum. Silakan pilih supplier dan masukkan harga satuan.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-5 border border-slate-200 rounded-xl bg-slate-50/50">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">
                Pilih Supplier
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Pilih Supplier --</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.code} - {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">
                Tgl. Estimasi Datang (Opsional)
              </label>
              <input
                type="date"
                value={expectedDeliveryAt}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setExpectedDeliveryAt(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Pesanan rutin bulanan"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
              <h3 className="font-bold text-slate-900">
                Daftar Pesanan Barang
              </h3>
              <button
                onClick={handleAddItem}
                className="text-emerald-600 text-sm font-semibold hover:text-emerald-700 flex items-center gap-1 self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" /> Tambah Item
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[640px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-600">
                    <tr>
                      <th className="p-4">Barang</th>
                      <th className="p-4 w-40 text-center">Qty Pesanan</th>
                      <th className="p-4 w-36 text-right">Harga Satuan (Rp)</th>
                      <th className="p-4 w-40 text-right">Subtotal</th>
                      <th className="p-4 text-center w-14">#</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {poItems.map((item) => {
                      const selectedItem = items.find(
                        (i) => i.id === item.itemId,
                      );
                      const subtotal =
                        Number(item.quantity || 0) *
                        Number(item.unitPrice || 0);

                      return (
                        <tr key={item.key} className="bg-white">
                          <td className="p-4">
                            <select
                              value={item.itemId}
                              onChange={(e) =>
                                handleItemChange(
                                  item.key,
                                  "itemId",
                                  e.target.value,
                                )
                              }
                              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="">-- Pilih Barang --</option>
                              {items.map((itm) => (
                                <option key={itm.id} value={itm.id}>
                                  {itm.name} ({itm.unit})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-4">
                            <div className="flex shadow-sm rounded-lg">
                              <input
                                type="number"
                                min={1}
                                placeholder="0"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleItemChange(
                                    item.key,
                                    "quantity",
                                    e.target.value,
                                  )
                                }
                                className="w-full border border-slate-200 rounded-l-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 z-10"
                              />
                              <span className="bg-slate-50 border-y border-r border-slate-200 text-slate-500 text-sm px-3 py-2.5 rounded-r-lg whitespace-nowrap">
                                {selectedItem?.unit || "-"}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder="0"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleItemChange(
                                  item.key,
                                  "unitPrice",
                                  e.target.value,
                                )
                              }
                              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="p-4 text-right text-sm font-semibold text-slate-700 whitespace-nowrap">
                            Rp{subtotal.toLocaleString("id-ID")}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleRemoveItem(item.key)}
                              disabled={poItems.length === 1}
                              className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end mt-4 sm:pr-2">
              <div className="text-sm font-bold text-slate-900">
                Total:{" "}
                <span className="text-emerald-600">
                  Rp
                  {poItems
                    .reduce(
                      (acc, item) =>
                        acc +
                        Number(item.quantity || 0) *
                          Number(item.unitPrice || 0),
                      0,
                    )
                    .toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 sm:px-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:justify-end items-stretch sm:items-center gap-3 bg-white">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 sm:flex-1">
              {error}
            </div>
          )}

          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors w-full sm:w-auto"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors w-full sm:w-40"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" />
                Menyimpan...
              </span>
            ) : (
              "Simpan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
