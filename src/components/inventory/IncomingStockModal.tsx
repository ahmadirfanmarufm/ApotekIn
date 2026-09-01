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

function mapPoItemsToForms(
  items: PurchaseOrderDetailItem[],
  startKey: number,
): ReceiptItemForm[] {
  return items
    .filter((item) => item.remainingQty > 0)
    .map((item, index) => ({
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
  if (!props.isOpen) return null;

  return <IncomingStockModalContent {...props} />;
}

function IncomingStockModalContent({
  onClose,
  onSuccess,
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

  useEffect(() => {
    const loadPurchaseOrders = async () => {
      setIsLoadingPos(true);
      setError(null);

      try {
        let response: Response;

        response = await fetch("/api/purchase-order", {
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
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil daftar Purchase Order.",
        );
      } finally {
        setIsLoadingPos(false);
      }
    };

    void loadPurchaseOrders();
  }, []);

  useEffect(() => {
    if (!selectedPoId) return;

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

        setPoDetail(data.data);

        let mappedItems = mapPoItemsToForms(data.data.items, 1);

        setItems(mappedItems);

        setNextKey(mappedItems.length + 1);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Gagal mengambil detail PO.",
        );
      } finally {
        setIsLoadingPo(false);
      }
    };

    void loadPoDetail();
  }, [selectedPoId]);

  const handleSave = async () => {
    setError(null);

    if (!selectedPoId) {
      setError("Purchase Order wajib dipilih.");
      return;
    }

    const validItems = items.filter(
      (item) => item.purchaseOrderItemId && Number(item.quantity) > 0,
    );

    if (validItems.length === 0) {
      setError("Minimal harus ada 1 barang dengan jumlah lebih dari 0.");
      return;
    }

    for (const item of validItems) {
      if (!item.batchNumber.trim() || !item.expiryDate) {
        setError(
          "No. batch dan tanggal kedaluwarsa wajib diisi untuk setiap barang.",
        );
        return;
      }

      if (Number(item.quantity) > item.remainingQty) {
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
        throw new Error(data.message || "Gagal menyimpan penerimaan barang.");
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

  const handleAddItem = () => {
    if (!poDetail) return;

    const usedPurchaseOrderItemIds = new Set(
      items.map((item) => item.purchaseOrderItemId),
    );

    const availableItem = poDetail.items.find(
      (item) => item.remainingQty > 0 && !usedPurchaseOrderItemIds.has(item.id),
    );

    if (!availableItem) {
      setError("Semua barang yang masih tersedia sudah ditambahkan.");
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

  const handleRemoveItem = (key: number) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const handleItemFieldChange = (
    key: number,
    field: keyof ReceiptItemForm,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;

        if (field === "purchaseOrderItemId") {
          const poItem = poDetail?.items.find((i) => i.id === value);

          return {
            ...item,
            purchaseOrderItemId: value,
            batchNumber: poItem?.suggestedBatchNumber ?? "",
            expiryDate: poItem?.suggestedExpiryDate
              ? new Date(poItem.suggestedExpiryDate).toISOString().split("T")[0]
              : "",
            quantity: String(poItem?.remainingQty ?? ""),
            orderedQty: poItem?.orderedQty ?? 0,
            receivedQty: poItem?.receivedQty ?? 0,
            remainingQty: poItem?.remainingQty ?? 0,
            unit: poItem?.item.unit ?? "",
            itemName: poItem ? `${poItem.item.name} (${poItem.item.code})` : "",
          };
        }

        return { ...item, [field]: value };
      }),
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        <div className="px-4 py-4 sm:px-6 border-b border-slate-200 flex justify-between items-center bg-white gap-3">
          <h2 className="text-base sm:text-xl font-bold text-slate-900 truncate">
            Form Penerimaan Barang PO
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-5 border border-slate-200 rounded-xl bg-white">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">
                Filter:
              </label>
              <select
                value={selectedPoId}
                onChange={(e) => setSelectedPoId(e.target.value)}
                disabled={isLoadingPos}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {isLoadingPos ? "Memuat daftar PO..." : "-- Pilih PO --"}
                </option>
                {poOptions.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.poNumber} - {po.supplierName} ({po.status})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">
                Nomor Faktur / Surat Jalan
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Contoh: INV/2026/08/001"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">
                Tanggal Masuk
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
              <h3 className="font-bold text-slate-900">List Barang Diterima</h3>
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
                      <th className="p-4 w-1/3">Pilih Barang</th>
                      <th className="p-4">No. Batch</th>
                      <th className="p-4">Exp Date</th>
                      <th className="p-4">Qty</th>
                      <th className="p-4 text-center w-16">#</th>
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
                          Pilih PO terlebih dahulu untuk menampilkan daftar
                          barang.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.key} className="bg-white">
                          <td className="p-4">
                            <select
                              value={item.purchaseOrderItemId}
                              onChange={(e) =>
                                handleItemFieldChange(
                                  item.key,
                                  "purchaseOrderItemId",
                                  e.target.value,
                                )
                              }
                              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="">Pilih Barang</option>
                              {poDetail?.items
                                .filter((i) => i.remainingQty > 0)
                                .map((poItem) => (
                                  <option key={poItem.id} value={poItem.id}>
                                    {poItem.item.name} ({poItem.item.code}) -
                                    Sisa Qty: {poItem.remainingQty}
                                  </option>
                                ))}
                            </select>
                          </td>
                          <td className="p-4">
                            <input
                              type="text"
                              value={item.batchNumber}
                              onChange={(e) =>
                                handleItemFieldChange(
                                  item.key,
                                  "batchNumber",
                                  e.target.value,
                                )
                              }
                              placeholder="Contoh: PCL-0230-2222"
                              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="date"
                              value={item.expiryDate}
                              onChange={(e) =>
                                handleItemFieldChange(
                                  item.key,
                                  "expiryDate",
                                  e.target.value,
                                )
                              }
                              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex shadow-sm rounded-lg">
                              <input
                                type="number"
                                min={1}
                                max={item.remainingQty}
                                value={item.quantity}
                                onChange={(e) =>
                                  handleItemFieldChange(
                                    item.key,
                                    "quantity",
                                    e.target.value,
                                  )
                                }
                                className="w-20 border border-slate-200 rounded-l-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 z-10"
                              />
                              <span className="bg-slate-50 border-y border-r border-slate-200 text-slate-500 text-sm px-3 py-2.5 rounded-r-lg whitespace-nowrap">
                                {item.unit || "-"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Diterima: {item.receivedQty}/{item.orderedQty} ·
                              Sisa: {item.remainingQty}
                            </p>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleRemoveItem(item.key)}
                              className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
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
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center justify-center">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
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
