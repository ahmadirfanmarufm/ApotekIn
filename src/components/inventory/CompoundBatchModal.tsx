"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Loader2, X } from "lucide-react";

interface CompoundBatchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemId: string;
    itemUnit: string;
    batch?: {
        id: string;
        batchNumber: string;
        quantity: number;
        initialQuantity: number;
        expiryDate: string;
        buyPrice: string;
        sellPrice: string;
    } | null;
    onSaved?: () => void;
}

type BatchForm = {
    batchNumber: string;
    quantity: string;
    expiryDate: string;
    buyPrice: string;
    sellPrice: string;
};

const emptyForm: BatchForm = {
    batchNumber: "",
    quantity: "",
    expiryDate: "",
    buyPrice: "",
    sellPrice: "",
};

export function CompoundBatchModal({
    open,
    onOpenChange,
    itemId,
    itemUnit,
    batch,
    onSaved,
}: CompoundBatchModalProps) {
    const [form, setForm] = useState<BatchForm>(emptyForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isEdit = Boolean(batch?.id);

    useEffect(() => {
        if (!open) return;

        if (batch) {
            setForm({
                batchNumber: batch.batchNumber ?? "",
                quantity: String(batch.quantity ?? ""),
                expiryDate: batch.expiryDate
                    ? batch.expiryDate.split("T")[0]
                    : "",
                buyPrice: String(batch.buyPrice ?? ""),
                sellPrice: String(batch.sellPrice ?? ""),
            });
        } else {
            setForm(emptyForm);
        }

        setError("");
    }, [open, batch]);

    const updateField = (
        field: keyof BatchForm,
        value: string
    ) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");

        if (!form.batchNumber.trim()) {
            setError("Nomor batch wajib diisi.");
            return;
        }

        if (Number(form.quantity) <= 0) {
            setError("Jumlah stok harus lebih dari 0.");
            return;
        }

        if (!form.expiryDate) {
            setError("Tanggal kedaluwarsa wajib diisi.");
            return;
        }

        if (Number(form.buyPrice) < 0) {
            setError("Harga beli tidak boleh negatif.");
            return;
        }

        if (Number(form.sellPrice) < 0) {
            setError("Harga jual tidak boleh negatif.");
            return;
        }

        try {
            setLoading(true);

            const url = isEdit
                ? `/api/inventory/compound/${itemId}/batches/${batch?.id}`
                : `/api/inventory/compound/${itemId}/batches`;

            const response = await fetch(url, {
                method: isEdit ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    batchNumber: form.batchNumber.trim(),
                    quantity: Number(form.quantity),
                    expiryDate: form.expiryDate,
                    buyPrice: Number(form.buyPrice),
                    sellPrice: Number(form.sellPrice),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Gagal menyimpan batch."
                );
            }

            onOpenChange(false);
            onSaved?.();
        } catch (err) {
            console.error(
                "COMPOUND BATCH ERROR:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Terjadi kesalahan saat menyimpan batch."
            );
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
            onMouseDown={() =>
                !loading && onOpenChange(false)
            }
        >
            <div
                className="w-full max-w-xl rounded-2xl bg-white shadow-2xl"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                        <h2 className="font-manrope text-lg font-bold text-slate-900">
                            {isEdit
                                ? "Edit Batch"
                                : "Tambah Batch"}
                        </h2>

                        <p className="text-xs text-slate-400">
                            Kelola stok batch bahan racikan.
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                            onOpenChange(false)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={19} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 p-5"
                >
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Nomor Batch
                        </label>

                        <input
                            value={form.batchNumber}
                            onChange={(e) =>
                                updateField(
                                    "batchNumber",
                                    e.target.value
                                )
                            }
                            placeholder="BTH-2026-001"
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Jumlah Stok
                        </label>

                        <div className="relative">
                            <input
                                type="number"
                                min="1"
                                value={form.quantity}
                                onChange={(e) =>
                                    updateField(
                                        "quantity",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-16 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />

                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                {itemUnit || "unit"}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                            <CalendarDays size={15} />
                            Kedaluwarsa
                        </label>

                        <input
                            type="date"
                            value={form.expiryDate}
                            onChange={(e) =>
                                updateField(
                                    "expiryDate",
                                    e.target.value
                                )
                            }
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Harga Beli
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={form.buyPrice}
                                onChange={(e) =>
                                    updateField(
                                        "buyPrice",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Harga Jual
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={form.sellPrice}
                                onChange={(e) =>
                                    updateField(
                                        "sellPrice",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() =>
                                onOpenChange(false)
                            }
                            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                            {loading && (
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                            )}

                            {loading
                                ? "Menyimpan..."
                                : isEdit
                                ? "Simpan Perubahan"
                                : "Tambah Batch"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}