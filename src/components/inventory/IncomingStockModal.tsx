"use client";

import { useEffect, useState } from "react";
import { X, Trash2, Plus, Loader2 } from "lucide-react";

import type {
  PurchaseOrderDetail,
  PurchaseOrderDetailItem,
  PurchaseOrderListItem,
} from "@/types/purchase-order";
import type { ReceivablePoOption } from "@/types/stock-receipt";

interface IncomingStockModalProps {
  isOpen: boolean;
  restockItemId?: string | null;
  restockQuantity?: number | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ReceiptItemForm {
  key: number;
  purchaseOrderItemId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: string;
  orderedQty: number;
  receivedQty: number;
  remainingQty: number;
  unit: string;
  itemName: string;
}

/**
 * Mengubah item PO menjadi format form penerimaan stok.
 *
 * Jika modal dibuka melalui tombol Restock:
 * - item yang direstock akan diprioritaskan
 * - quantity akan mengikuti restockQuantity
 * - quantity tidak boleh melebihi remainingQty
 *
 * Jika bukan dari Restock:
 * - seluruh item PO yang masih memiliki sisa quantity akan ditampilkan
 */
function mapPoItemsToForms(
  items: PurchaseOrderDetailItem[],
  startKey: number,
  restockItemId?: string | null,
  restockQuantity?: number | null,
): ReceiptItemForm[] {
  const availableItems = items.filter((item) => item.remainingQty > 0);

  // Prioritaskan item yang sedang direstock.
  if (restockItemId) {
    const restockItem = availableItems.find(
      (item) => item.itemId === restockItemId,
    );

    if (restockItem) {
      const quantity =
        restockQuantity && restockQuantity > 0
          ? Math.min(restockQuantity, restockItem.remainingQty)
          : restockItem.remainingQty;

      return [
        {
          key: startKey,
          purchaseOrderItemId: restockItem.id,
          batchNumber: restockItem.suggestedBatchNumber ?? "",
          expiryDate: restockItem.suggestedExpiryDate
            ? new Date(restockItem.suggestedExpiryDate)
                .toISOString()
                .split("T")[0]
            : "",
          quantity: String(quantity),
          orderedQty: restockItem.orderedQty,
          receivedQty: restockItem.receivedQty,
          remainingQty: restockItem.remainingQty,
          unit: restockItem.item.unit,
          itemName: `${restockItem.item.name} (${restockItem.item.code})`,
        },
      ];
    }
  }

  // Default: tampilkan semua item PO yang masih dapat diterima.
  return availableItems.map((item, index) => ({
    key: startKey + index,
    purchaseOrderItemId: item.id,
    batchNumber: item.suggestedBatchNumber ?? "",
    expiryDate: item.suggestedExpiryDate
      ? new Date(item.suggestedExpiryDate).toISOString().split("T")[0]
      : "",
    quantity: String(item.remainingQty),
    orderedQty: item.orderedQty,
    receivedQty: item.receivedQty,
    remainingQty: item.remainingQty,
    unit: item.item.unit,
    itemName: `${item.item.name} (${item.item.code})`,
  }));
}

export function IncomingStockModal(props: IncomingStockModalProps) {
  if (!props.isOpen) {
    return null;
  }

  return <IncomingStockModalContent {...props} />;
}

function IncomingStockModalContent({
  onClose,
  onSuccess,
  restockItemId,
  restockQuantity,
}: IncomingStockModalProps) {
  const [poOptions, setPoOptions] = useState<ReceivablePoOption[]>([]);
  const [selectedPoId, setSelectedPoId] = useState("");
  const [poDetail, setPoDetail] = useState<PurchaseOrderDetail | null>(null);

  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [receivedDate, setReceivedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [items, setItems] = useState<ReceiptItemForm[]>([]);
  const [nextKey, setNextKey] = useState(1);

  const [isLoadingPos, setIsLoadingPos] = useState(false);
  const [isLoadingPo, setIsLoadingPo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /**
   * Load daftar Purchase Order yang masih memiliki
   * item yang belum sepenuhnya diterima.
   */
  useEffect(() => {
    const loadPurchaseOrders = async () => {
      setIsLoadingPos(true);
      setError(null);

      try {
        const response = await fetch("/api/purchase-order", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Gagal mengambil daftar Purchase Order.",
          );
        }

        const purchaseOrders: PurchaseOrderListItem[] = data.data ?? [];

        const receivable = purchaseOrders.filter((po) =>
          po.items?.some(
            (item: { quantity: number; receivedQty: number }) =>
              item.receivedQty < item.quantity,
          ),
        );

        setPoOptions(
          receivable.map((po) => ({
            id: po.id,
            poNumber: po.poNumber,
            status: po.status,
            supplierName: po.supplier?.name ?? "-",
          })),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil daftar Purchase Order.",
        );
      } finally {
        setIsLoadingPos(false);
      }
    };

    void loadPurchaseOrders();
  }, []);

  /**
   * Load detail PO ketika user memilih PO.
   */
  useEffect(() => {
    if (!selectedPoId) {
      setPoDetail(null);
      setItems([]);
      return;
    }

    const loadPoDetail = async () => {
      setIsLoadingPo(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/inventory/incoming/po/${selectedPoId}`,
          {
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Gagal mengambil detail PO.");
        }

        const detail: PurchaseOrderDetail = data.data;

        setPoDetail(detail);

        const mappedItems = mapPoItemsToForms(
          detail.items,
          1,
          restockItemId,
          restockQuantity,
        );

        setItems(mappedItems);
        setNextKey(mappedItems.length + 1);

        /**
         * Validasi tambahan untuk Restock.
         * Pastikan item yang dipilih memang masih tersedia
         * pada PO yang sedang dibuka.
         */
        if (restockItemId) {
          const restockItemExists = detail.items.some(
            (item) =>
              item.itemId === restockItemId && item.remainingQty > 0,
          );

          if (!restockItemExists) {
            setError(
              "Barang yang dipilih untuk restock tidak ditemukan atau sudah terpenuhi pada Purchase Order ini.",
            );
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil detail PO.",
        );
      } finally {
        setIsLoadingPo(false);
      }
    };

    void loadPoDetail();
  }, [selectedPoId, restockItemId, restockQuantity]);

  /**
   * Simpan penerimaan stok.
   */
  const handleSave = async () => {
    setError(null);

    if (!selectedPoId) {
      setError("Purchase Order wajib dipilih.");
      return;
    }

    if (!receivedDate) {
      setError("Tanggal masuk wajib diisi.");
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.purchaseOrderItemId &&
        Number(item.quantity) > 0,
    );

    if (validItems.length === 0) {
      setError("Minimal harus ada 1 barang dengan jumlah lebih dari 0.");
      return;
    }

    for (const item of validItems) {
      const quantity = Number(item.quantity);

      if (!item.batchNumber.trim()) {
        setError(
          `No. batch wajib diisi untuk ${item.itemName}.`,
        );
        return;
      }

      if (!item.expiryDate) {
        setError(
          `Tanggal kedaluwarsa wajib diisi untuk ${item.itemName}.`,
        );
        return;
      }

      if (quantity <= 0) {
        setError(
          `Jumlah untuk ${item.itemName} harus lebih dari 0.`,
        );
        return;
      }

      if (quantity > item.remainingQty) {
        setError(
          `Jumlah untuk ${item.itemName} melebihi sisa yang harus diterima (sisa: ${item.remainingQty}).`,
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/inventory/incoming", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          purchaseOrderId: selectedPoId,
          invoiceNumber: invoiceNumber.trim() || undefined,
          receivedAt: receivedDate,
          items: validItems.map((item) => ({
            purchaseOrderItemId: item.purchaseOrderItemId,
            quantity: Number(item.quantity),
            batchNumber: item.batchNumber.trim(),
            expiryDate: item.expiryDate,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gagal menyimpan penerimaan barang.",
        );
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan penerimaan barang.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Tambahkan item lain dari PO.
   */
  const handleAddItem = () => {
    if (!poDetail) {
      return;
    }

    const usedPurchaseOrderItemIds = new Set(
      items.map((item) => item.purchaseOrderItemId),
    );

    const availableItem = poDetail.items.find(
      (item) =>
        item.remainingQty > 0 &&
        !usedPurchaseOrderItemIds.has(item.id),
    );

    if (!availableItem) {
      setError(
        "Semua barang yang masih tersedia sudah ditambahkan.",
      );
      return;
    }

    setError(null);

    setItems((prev) => [
      ...prev,
      {
        key: nextKey,
        purchaseOrderItemId: availableItem.id,
        batchNumber: availableItem.suggestedBatchNumber ?? "",
        expiryDate: availableItem.suggestedExpiryDate
          ? new Date(availableItem.suggestedExpiryDate)
              .toISOString()
              .split("T")[0]
          : "",
        quantity: String(availableItem.remainingQty),
        orderedQty: availableItem.orderedQty,
        receivedQty: availableItem.receivedQty,
        remainingQty: availableItem.remainingQty,
        unit: availableItem.item.unit,
        itemName: `${availableItem.item.name} (${availableItem.item.code})`,
      },
    ]);

    setNextKey((prev) => prev + 1);
  };

  /**
   * Hapus item dari daftar penerimaan.
   */
  const handleRemoveItem = (key: number) => {
    setItems((prev) =>
      prev.filter((item) => item.key !== key),
    );
  };

  /**
   * Update field pada item penerimaan.
   */
  const handleItemFieldChange = (
    key: number,
    field: keyof ReceiptItemForm,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) {
          return item;
        }

        /**
         * Jika barang diganti, seluruh informasi
         * yang bergantung pada PO item ikut diperbarui.
         */
        if (field === "purchaseOrderItemId") {
          const poItem = poDetail?.items.find(
            (candidate) => candidate.id === value,
          );

          return {
            ...item,
            purchaseOrderItemId: value,
            batchNumber: poItem?.suggestedBatchNumber ?? "",
            expiryDate: poItem?.suggestedExpiryDate
              ? new Date(poItem.suggestedExpiryDate)
                  .toISOString()
                  .split("T")[0]
              : "",
            quantity: String(poItem?.remainingQty ?? ""),
            orderedQty: poItem?.orderedQty ?? 0,
            receivedQty: poItem?.receivedQty ?? 0,
            remainingQty: poItem?.remainingQty ?? 0,
            unit: poItem?.item.unit ?? "",
            itemName: poItem
              ? `${poItem.item.name} (${poItem.item.code})`
              : "",
          };
        }

        return {
          ...item,
          [field]: value,
        };
      }),
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-4">
      <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
          <h2 className="truncate text-base font-bold text-slate-900 sm:text-xl">
            Form Penerimaan Barang PO
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="shrink-0 text-slate-400 transition-colors hover:text-slate-600"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 overflow-y-auto p-4 sm:space-y-8 sm:p-6">
          {/* PO Information */}
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 sm:gap-6 sm:p-5 lg:grid-cols-3">
            {/* Purchase Order */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">
                Purchase Order
              </label>

              <select
                value={selectedPoId}
                onChange={(event) =>
                  setSelectedPoId(event.target.value)
                }
                disabled={isLoadingPos}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {isLoadingPos
                    ? "Memuat daftar PO..."
                    : "-- Pilih PO --"}
                </option>

                {poOptions.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.poNumber} - {po.supplierName} ({po.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Invoice */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">
                Nomor Faktur / Surat Jalan
              </label>

              <input
                type="text"
                value={invoiceNumber}
                onChange={(event) =>
                  setInvoiceNumber(event.target.value)
                }
                placeholder="Contoh: INV/2026/08/001"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Received Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">
                Tanggal Masuk
              </label>

              <input
                type="date"
                value={receivedDate}
                onChange={(event) =>
                  setReceivedDate(event.target.value)
                }
                className="w-full appearance-none rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-slate-900">
                  List Barang Diterima
                </h3>

                {poDetail && (
                  <p className="mt-1 text-xs text-slate-500">
                    {poDetail.supplier?.name
                      ? `Supplier: ${poDetail.supplier.name}`
                      : "Barang yang tersedia pada Purchase Order"}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                disabled={!poDetail || isLoadingPo}
                className="flex items-center gap-1 self-start text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                Tambah Item
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-600">
                    <tr>
                      <th className="w-1/3 p-4">
                        Pilih Barang
                      </th>
                      <th className="p-4">No. Batch</th>
                      <th className="p-4">Exp Date</th>
                      <th className="p-4">Qty</th>
                      <th className="w-16 p-4 text-center">
                        #
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {isLoadingPo ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center">
                          <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Memuat barang dari PO...
                          </span>
                        </td>
                      </tr>
                    ) : items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-8 text-center text-sm text-slate-400"
                        >
                          {selectedPoId
                            ? "Tidak ada barang yang masih dapat diterima."
                            : "Pilih PO terlebih dahulu untuk menampilkan daftar barang."}
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr
                          key={item.key}
                          className="bg-white"
                        >
                          {/* Item */}
                          <td className="p-4">
                            <select
                              value={item.purchaseOrderItemId}
                              onChange={(event) =>
                                handleItemFieldChange(
                                  item.key,
                                  "purchaseOrderItemId",
                                  event.target.value,
                                )
                              }
                              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="">
                                Pilih Barang
                              </option>

                              {poDetail?.items
                                .filter(
                                  (poItem) =>
                                    poItem.remainingQty > 0,
                                )
                                .map((poItem) => (
                                  <option
                                    key={poItem.id}
                                    value={poItem.id}
                                  >
                                    {poItem.item.name} (
                                    {poItem.item.code}) -
                                    Sisa Qty:{" "}
                                    {poItem.remainingQty}
                                  </option>
                                ))}
                            </select>
                          </td>

                          {/* Batch */}
                          <td className="p-4">
                            <input
                              type="text"
                              value={item.batchNumber}
                              onChange={(event) =>
                                handleItemFieldChange(
                                  item.key,
                                  "batchNumber",
                                  event.target.value,
                                )
                              }
                              placeholder="Contoh: PCL-0230-2222"
                              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>

                          {/* Expiry */}
                          <td className="p-4">
                            <input
                              type="date"
                              value={item.expiryDate}
                              onChange={(event) =>
                                handleItemFieldChange(
                                  item.key,
                                  "expiryDate",
                                  event.target.value,
                                )
                              }
                              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>

                          {/* Quantity */}
                          <td className="p-4">
                            <div className="flex rounded-lg shadow-sm">
                              <input
                                type="number"
                                min={1}
                                max={item.remainingQty}
                                value={item.quantity}
                                onChange={(event) =>
                                  handleItemFieldChange(
                                    item.key,
                                    "quantity",
                                    event.target.value,
                                  )
                                }
                                className="z-10 w-20 rounded-l-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />

                              <span className="whitespace-nowrap rounded-r-lg border-y border-r border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
                                {item.unit || "-"}
                              </span>
                            </div>

                            <p className="mt-1 text-[11px] text-slate-400">
                              Diterima: {item.receivedQty}/
                              {item.orderedQty} · Sisa:{" "}
                              {item.remainingQty}
                            </p>
                          </td>

                          {/* Remove */}
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveItem(item.key)
                              }
                              disabled={isSubmitting}
                              aria-label={`Hapus ${item.itemName}`}
                              className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse items-stretch gap-3 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 sm:mr-auto sm:flex-1">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-slate-300 px-6 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || isLoadingPo}
            className="w-full rounded-xl bg-emerald-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Menyimpan...
              </span>
            ) : (
              <span>Simpan Stok Masuk</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}