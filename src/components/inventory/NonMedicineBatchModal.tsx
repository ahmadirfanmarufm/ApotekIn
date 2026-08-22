"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BatchData {
    id?: string;
    batchNumber: string;
    quantity: number;
    initialQuantity: number;
    expiryDate: string;
    buyPrice: number | string;
    sellPrice: number | string;
}

interface NonMedicineBatchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemId: string;
    itemUnit: string;
    batch?: BatchData | null;
    onSaved?: () => void;
}

export function NonMedicineBatchModal({ open, onOpenChange, itemId, itemUnit, batch, onSaved }: NonMedicineBatchModalProps) {
    const isEdit = Boolean(batch);

    const [batchNumber, setBatchNumber] = useState("");
    const [quantity, setQuantity] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [buyPrice, setBuyPrice] = useState("");
    const [sellPrice, setSellPrice] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (batch) {
            setBatchNumber(batch.batchNumber ?? "");
            setQuantity(String(batch.quantity ?? ""));

            setExpiryDate(
                batch.expiryDate
                    ? new Date(batch.expiryDate)
                          .toISOString()
                          .split("T")[0]
                    : ""
            );

            setBuyPrice(String(batch.buyPrice ?? ""));
            setSellPrice(String(batch.sellPrice ?? ""));
        } else {
            setBatchNumber("");
            setQuantity("");
            setExpiryDate("");
            setBuyPrice("");
            setSellPrice("");
        }

        setError("");
    }, [batch, open]);

    const handleSubmit = async () => {
        setError("");

        if (!batchNumber.trim()) {
            setError("Nomor batch wajib diisi.");
            return;
        }

        if (!expiryDate) {
            setError("Tanggal kedaluwarsa wajib diisi.");
            return;
        }

        if (Number(buyPrice) < 0 || Number(sellPrice) < 0) {
            setError("Harga tidak boleh bernilai negatif.");
            return;
        }

        if (!isEdit && Number(quantity) <= 0) {
            setError("Jumlah stok harus lebih dari 0.");
            return;
        }

        if (Number(sellPrice) < Number(buyPrice)) {
            setError("Harga jual tidak boleh lebih kecil dari harga beli.");
            return;
        }

        try {
            setLoading(true);

            const url = isEdit
                ? `/api/inventory/nonmedicine/${itemId}/batches/${batch?.id}`
                : `/api/inventory/nonmedicine/${itemId}/batches`;

            const method = isEdit ? "PUT" : "POST";

            const body = isEdit
                ? {
                      batchNumber: batchNumber.trim(),
                      expiryDate,
                      buyPrice: Number(buyPrice),
                      sellPrice: Number(sellPrice),
                  }
                : {
                      batchNumber: batchNumber.trim(),
                      quantity: Number(quantity),
                      expiryDate,
                      buyPrice: Number(buyPrice),
                      sellPrice: Number(sellPrice),
                  };

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Gagal menyimpan batch."
                );
            }

            onOpenChange(false);

            onSaved?.();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (!loading) {
                    onOpenChange(value);
                }
            }}
        >
            <DialogContent
                className="
                    max-h-[90vh]
                    w-[calc(100%-2rem)]
                    max-w-lg
                    overflow-y-auto
                    rounded-2xl
                    p-0
                "
            >
                <DialogHeader className="border-b border-slate-100 px-5 py-5 sm:px-6">
                    <DialogTitle className="font-manrope text-xl font-bold text-slate-900">
                        {isEdit ? "Edit Batch" : "Tambah Batch"}
                    </DialogTitle>

                    <DialogDescription>
                        {isEdit
                            ? "Perbarui informasi batch obat."
                            : "Tambahkan batch baru untuk obat ini."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 px-5 py-6 sm:px-6">

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Nomor Batch
                        </label>

                        <Input
                            value={batchNumber}
                            onChange={(e) =>
                                setBatchNumber(e.target.value)
                            }
                            placeholder="Contoh: BCH-PCM-202608"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Jumlah Stok
                        </label>

                        <div className="flex items-center gap-3">
                            <Input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) =>
                                    setQuantity(e.target.value)
                                }
                                disabled={isEdit}
                            />

                            <span className="shrink-0 text-sm text-slate-500">
                                {itemUnit}
                            </span>
                        </div>

                        {isEdit && (
                            <p className="mt-1 text-xs text-slate-400">
                                Stok tidak dapat diubah melalui edit batch.
                                Gunakan transaksi stok masuk/keluar.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Tanggal Kedaluwarsa
                        </label>

                        <Input
                            type="date"
                            value={expiryDate}
                            onChange={(e) =>
                                setExpiryDate(e.target.value)
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Harga Beli
                            </label>

                            <Input
                                type="number"
                                min="0"
                                value={buyPrice}
                                onChange={(e) =>
                                    setBuyPrice(e.target.value)
                                }
                                placeholder="3500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Harga Jual
                            </label>

                            <Input
                                type="number"
                                min="0"
                                value={sellPrice}
                                onChange={(e) =>
                                    setSellPrice(e.target.value)
                                }
                                placeholder="6000"
                            />
                        </div>

                    </div>

                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-5 py-5 sm:flex-row sm:justify-end sm:px-6">

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Batal
                    </Button>

                    <Button
                        type="button"
                        className="bg-emerald-500 text-white hover:bg-emerald-600"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading
                            ? "Menyimpan..."
                            : isEdit
                              ? "Simpan Perubahan"
                              : "Tambah Batch"}
                    </Button>

                </div>
            </DialogContent>
        </Dialog>
    );
}