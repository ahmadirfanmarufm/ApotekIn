"use client";

import { useEffect, useState } from "react";
import {
    Beaker,
    CalendarDays,
    Loader2,
    Pencil,
    Plus,
    Trash2,
    X,
} from "lucide-react";
import type { CompoundBatch, CompoundFormData } from "@/types/inventory";
import { CompoundBatchModal } from "./CompoundBatchModal";

type CompoundItem = {
    id?: string;
    name?: string;
    code?: string;
    isActive?: boolean;
    unit?: string;
    minStock?: number;
    maxStock?: number;
    description?: string | null;
    batches?: {
        id: string;
        batchNumber: string;
        quantity: number;
        initialQuantity: number;
        expiryDate: string;
        buyPrice: string;
        sellPrice: string;
    }[];
};

interface CompoundItemModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item?: CompoundItem | null;
}

const emptyForm: CompoundFormData = {
    name: "",
    code: "",
    unit: "",
    minStock: "10",
    maxStock: "100",
    description: "",

    batchNumber: "",
    quantity: "",
    expiryDate: "",
    buyPrice: "",
    sellPrice: "",
};

const COMPOUND_UNITS = [
    { value: "GRAM", label: "Gram (g)" },
    { value: "MILLIGRAM", label: "Miligram (mg)" },
    { value: "MILILITER", label: "Mililiter (mL)" },
    { value: "LITER", label: "Liter (L)" },
    { value: "KAPSUL", label: "Kapsul" },
    { value: "TABLET", label: "Tablet" },
    { value: "BOTOL", label: "Botol" },
    { value: "TUBE", label: "Tube" },
    { value: "SACHET", label: "Sachet" },
];

export function CompoundItemModal({open, onOpenChange, item}: CompoundItemModalProps) {
    const [form, setForm] = useState<CompoundFormData>(emptyForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [batchModalOpen, setBatchModalOpen] = useState(false);

    const [selectedBatch, setSelectedBatch] = useState<CompoundBatch | null>(null);

    const isEdit = Boolean(item?.id);

    useEffect(() => {
        if (!open) return;
        
        if (item) {
            const batch = item.batches?.[0];

            setForm({
                name: item.name ?? "",
                code: item.code ?? "",
                unit: item.unit?.toUpperCase() ?? "",
                minStock: String(item.minStock ?? 10),
                maxStock: String(item.maxStock ?? 100),
                description: item.description ?? "",
                batchNumber: batch?.batchNumber ?? "",
                quantity: batch ? String(batch.quantity) : "",
                expiryDate: batch ? batch.expiryDate.split("T")[0] : "",
                buyPrice: batch ? String(batch.buyPrice) : "",
                sellPrice: batch ? String(batch.sellPrice) : "",
            });
        } else {
            setForm(emptyForm);
        }

        setError("");
    }, [open, item]);

    if (!open) return null;

    const updateField = (field: keyof CompoundFormData, value: string) => {
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

        if (!form.name.trim()) {
            setError("Nama bahan racikan wajib diisi.");
            return;
        }
        
        if (!form.unit.trim()) {
            setError("Satuan wajib diisi.");
            return;
        }

        if (Number(form.minStock) > Number(form.maxStock)) {
            setError("Minimum stok tidak boleh lebih besar dari maksimum stok.");
            return;
        }

        if (!isEdit) {
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
        }

        try {
            setLoading(true);

            const response = await fetch(isEdit ? `/api/inventory/compound/${item?.id}` : "/api/inventory/compound",
                {
                    method: isEdit ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: form.name.trim(),
                        unit: form.unit.trim(),
                        minStock: Number(form.minStock),
                        maxStock: Number(form.maxStock),
                        description:
                            form.description.trim() ||
                            null,

                        ...(!isEdit && {
                            batch: {
                                batchNumber: form.batchNumber.trim(),
                                quantity: Number(form.quantity),
                                expiryDate: form.expiryDate,
                                buyPrice: Number(form.buyPrice),
                                sellPrice: Number(form.sellPrice),
                            },
                        }),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal menyimpan bahan racikan.");
            }

            onOpenChange(false);

            window.location.reload();
        } catch (err) {
            console.error(
                "COMPOUND ITEM ERROR:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Terjadi kesalahan saat menyimpan bahan racikan."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleAddBatch = () => {
        setSelectedBatch(null);
        setBatchModalOpen(true);
    };

    const handleEditBatch = (batch: CompoundBatch) => {
        setSelectedBatch(batch);
        setBatchModalOpen(true);
    };

    const handleDeleteBatch = async (batchId: string) => {
        if (!item?.id) return;

        const confirmed = window.confirm(
            "Apakah Anda yakin ingin menghapus batch ini?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `/api/inventory/compound/${item.id}/batches/${batchId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Gagal menghapus batch."
                );
            }

            window.location.reload();
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan saat menghapus batch."
            );
        }
};

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
            onMouseDown={() =>
                !loading && onOpenChange(false)
            }
        >
            <div
                className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <Beaker size={20} />
                        </div>

                        <div>
                            <h2 className="font-manrope text-lg font-bold text-slate-900">
                                {isEdit
                                    ? "Edit Bahan Racikan"
                                    : "Tambah Bahan Racikan"}
                            </h2>

                            <p className="text-xs text-slate-400">
                                Kelola informasi bahan dan
                                stok batch
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                            onOpenChange(false)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                    >
                        <X size={19} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 p-5 sm:p-6"
                >
                    {/* Error */}
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Basic Information */}
                    <section>
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-slate-800">
                                Informasi Bahan
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                                Identitas dasar bahan racikan
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Nama Bahan
                                </label>

                                <input
                                    value={form.name}
                                    onChange={(e) =>
                                        updateField("name", e.target.value)
                                    }
                                    placeholder="Contoh: Paracetamol"
                                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Kode Bahan
                                </label>

                                <input
                                    value={form.code}
                                    disabled
                                    readOnly
                                    placeholder="Dibuat otomatis oleh sistem"
                                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 outline-none"
                                />

                                <p className="mt-1 text-[11px] text-slate-400">
                                    Kode bahan dibuat otomatis oleh sistem.
                                </p>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Satuan
                                </label>

                                <select
                                    value={form.unit}
                                    onChange={(e) => updateField("unit", e.target.value) }
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                >
                                    <option value="">Pilih satuan</option>

                                    {COMPOUND_UNITS.map((unit) => (
                                        <option
                                            key={unit.value}
                                            value={unit.value}
                                        >
                                            {unit.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Minimum Stok
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={form.minStock}
                                    onChange={(e) =>
                                        updateField(
                                            "minStock",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Maksimum Stok
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={
                                        form.maxStock
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "maxStock",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Keterangan
                                </label>

                                <textarea
                                    rows={3}
                                    value={
                                        form.description
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "description",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Contoh: Digunakan untuk racikan demam dan nyeri..."
                                    className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Batch */}
                    {!isEdit && (
                        <section className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4 sm:p-5">
                            <div className="mb-4">
                                <h3 className="text-sm font-bold text-slate-800">
                                    Batch Awal
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                    Masukkan stok batch pertama
                                    saat bahan dicatat ke dalam
                                    sistem.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Nomor Batch
                                    </label>

                                    <input
                                        value={
                                            form.batchNumber
                                        }
                                        onChange={(e) =>
                                            updateField(
                                                "batchNumber",
                                                e.target.value
                                            )
                                        }
                                        placeholder="BTH-2026-001"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
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
                                            value={
                                                form.quantity
                                            }
                                            onChange={(e) =>
                                                updateField(
                                                    "quantity",
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="100"
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-16 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                        />

                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                            {form.unit ||
                                                "unit"}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                                        <CalendarDays
                                            size={15}
                                        />
                                        Kedaluwarsa
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            form.expiryDate
                                        }
                                        onChange={(e) =>
                                            updateField(
                                                "expiryDate",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Harga Beli
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            form.buyPrice
                                        }
                                        onChange={(e) =>
                                            updateField(
                                                "buyPrice",
                                                e.target.value
                                            )
                                        }
                                        placeholder="0"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Harga Jual
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            form.sellPrice
                                        }
                                        onChange={(e) =>
                                            updateField(
                                                "sellPrice",
                                                e.target.value
                                            )
                                        }
                                        placeholder="0"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {isEdit && (
                        <section className="border-t border-slate-100 pt-6">
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">
                                        Batch Bahan
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Kelola stok dan kedaluwarsa setiap batch.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAddBatch}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    <Plus size={16} />
                                    Tambah Batch
                                </button>
                            </div>

                            <div className="space-y-3">
                                {item?.batches && item.batches.length > 0 ? (
                                    item.batches.map((batch) => (
                                        <div
                                            key={batch.id}
                                            className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <p className="font-semibold text-slate-800">
                                                    {batch.batchNumber}
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Stok:{" "}
                                                    <span className="font-medium text-slate-700">
                                                        {batch.quantity}{" "}
                                                        {form.unit || "unit"}
                                                    </span>
                                                </p>

                                                <p className="text-sm text-slate-500">
                                                    Exp:{" "}
                                                    {new Date(
                                                        batch.expiryDate
                                                    ).toLocaleDateString("id-ID")}
                                                </p>

                                                <p className="text-sm text-slate-500">
                                                    Beli: Rp{" "}
                                                    {Number(
                                                        batch.buyPrice
                                                    ).toLocaleString("id-ID")}
                                                </p>

                                                <p className="text-sm text-slate-500">
                                                    Jual: Rp{" "}
                                                    {Number(
                                                        batch.sellPrice
                                                    ).toLocaleString("id-ID")}
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEditBatch(batch)
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                                                >
                                                    <Pencil size={14} />
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteBatch(batch.id)
                                                    }
                                                    className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-red-500 hover:bg-red-50"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
                                        <p className="text-sm text-slate-400">
                                            Belum ada batch untuk bahan ini.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={handleAddBatch}
                                            className="mt-3 text-sm font-medium text-violet-600 hover:text-violet-700"
                                        >
                                            + Tambahkan batch
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Footer */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() =>
                                onOpenChange(false)
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
                                : "Tambah Bahan"}
                        </button>
                    </div>
                </form>
            </div>

            {isEdit && item?.id && (
                <CompoundBatchModal
                    open={batchModalOpen}
                    onOpenChange={setBatchModalOpen}
                    itemId={item.id}
                    itemUnit={form.unit}
                    batch={selectedBatch}
                    onSaved={() => {
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}