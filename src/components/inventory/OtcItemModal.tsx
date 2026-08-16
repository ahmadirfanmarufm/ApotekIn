"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OtcBatchModal } from "./OtcBatchModal";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Plus, Trash2, Pencil } from "lucide-react";

interface OtcItemModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item?: any | null;
}

export function OtcItemModal({
    open,
    onOpenChange,
    item,
}: OtcItemModalProps) {
    const isEdit = Boolean(item);

    const router = useRouter();

    const [batchModalOpen, setBatchModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<any | null>(null);

    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [unit, setUnit] = useState("");
    const [minStock, setMinStock] = useState("");
    const [maxStock, setMaxStock] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {

        if (item) {
            setName(item.name ?? "");
            setCode(item.code ?? "");
            setUnit(item.unit ?? "");
            setMinStock(String(item.minStock ?? ""));
            setMaxStock(String(item.maxStock ?? ""));
            setDescription(item.description ?? "");
            setImageUrl(item.imageUrl ?? "");
        } else {
            setName("");
            setCode("");
            setUnit("");
            setMinStock("");
            setMaxStock("");
            setDescription("");
            setImageUrl("");
        }

    }, [item, open]);

    const handleSubmit = async () => {
        try {
            const url = isEdit
                ? `/api/inventory/otc/${item.id}`
                : `/api/inventory/otc`;

            const method = isEdit ? "PUT" : "POST";

            const body = {
                name,
                unit,
                minStock: Number(minStock),
                maxStock: Number(maxStock),
                description,
                imageUrl,
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
                    data.message ||
                        "Gagal menyimpan obat."
                );
            }

            onOpenChange(false);
            router.refresh();

        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan."
            );
        }
    };

    const handleAddBatch = () => {
        setSelectedBatch(null);
        setBatchModalOpen(true);
    };

    const handleEditBatch = (batch: any) => {
        setSelectedBatch(batch);
        setBatchModalOpen(true);
    };

    const handleDeleteBatch = async (batchId: string) => {
        const confirmed = window.confirm(
            "Apakah Anda yakin ingin menghapus batch ini?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `/api/inventory/otc/${item.id}/batches/${batchId}`,
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

            router.refresh();
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan saat menghapus batch."
            );
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >

            <DialogContent
                className="
                    max-h-[90vh]
                    w-[calc(100%-2rem)]
                    max-w-3xl
                    overflow-y-auto
                    rounded-2xl
                    p-0
                "
            >

                <DialogHeader className="border-b border-slate-100 px-6 py-5">
                    <DialogTitle className="font-manrope text-xl font-bold text-slate-900">
                        {isEdit ? "Edit Obat OTC" : "Tambah Obat OTC"}
                    </DialogTitle>

                    <DialogDescription>
                        {isEdit
                            ? "Perbarui informasi obat dan pengaturan stok."
                            : "Tambahkan obat baru ke inventaris OTC."
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 px-6 py-6">

                    {/* Informasi Obat */}

                    <div>
                        <h3 className="mb-4 font-semibold text-slate-900">
                            Informasi Obat
                        </h3>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Nama Obat
                                </label>

                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Contoh: Paracetamol 500mg"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Kode Obat
                                </label>

                                <Input
                                    value={item?.code ?? "Akan dibuat otomatis"}
                                    disabled
                                    readOnly
                                    className="cursor-not-allowed bg-slate-100 text-slate-500"
                                />

                                {!isEdit && (
                                    <p className="mt-1.5 text-xs text-slate-400">
                                        Kode obat akan dibuat otomatis oleh sistem.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Satuan
                                </label>

                                <Input
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    placeholder="Strip / Botol / Box"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Minimum Stok
                                </label>

                                <Input
                                    type="number"
                                    value={minStock}
                                    onChange={(e) => setMinStock(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Maksimum Stok
                                </label>

                                <Input
                                    type="number"
                                    value={maxStock}
                                    onChange={(e) => setMaxStock(e.target.value)}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    URL Foto Obat
                                </label>

                                <Input
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Deskripsi
                                </label>

                                <Textarea
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Deskripsi singkat obat..."
                                    rows={3}
                                />
                            </div>

                        </div>
                    </div>

                    {/* Batch */}

                    {isEdit && (
                        <div className="border-t border-slate-100 pt-6">

                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <div>
                                    <h3 className="font-semibold text-slate-900">
                                        Batch Obat
                                    </h3>

                                    <p className="text-sm text-slate-400">
                                        Kelola batch dan tanggal kedaluwarsa.
                                    </p>
                                </div>

                                <Button
                                    variant="outline"
                                    type="button"
                                    size="sm"
                                    onClick={handleAddBatch}
                                >
                                    <Plus size={16} />
                                    Tambah Batch
                                </Button>

                            </div>

                            <div className="space-y-3">

                                {item.batches?.length > 0 ? (
                                    item.batches.map((batch: any) => (

                                        <div
                                            key={batch.id}
                                            className="
                                                flex flex-col gap-4
                                                rounded-xl
                                                border border-slate-200
                                                bg-slate-50
                                                p-4
                                                sm:flex-row
                                                sm:items-center
                                                sm:justify-between
                                            "
                                        >

                                            <div className="min-w-0">

                                                <p className="font-semibold text-slate-800">
                                                    {batch.batchNumber}
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Stok:{" "}
                                                    <span className="font-medium text-slate-700">
                                                        {batch.quantity} {unit}
                                                    </span>
                                                </p>

                                                <p className="text-sm text-slate-500">
                                                    Exp:{" "}
                                                    {new Date(
                                                        batch.expiryDate
                                                    ).toLocaleDateString("id-ID")}
                                                </p>

                                            </div>

                                            <div className="flex w-full gap-2 sm:w-auto">

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 sm:flex-none"
                                                    onClick={() =>
                                                        handleEditBatch(batch)
                                                    }
                                                >
                                                    <Pencil size={14} />
                                                    Edit
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-600"
                                                    onClick={() =>
                                                        handleDeleteBatch(batch.id)
                                                    }
                                                >
                                                    <Trash2 size={14} />
                                                </Button>

                                            </div>

                                        </div>

                                    ))
                                ) : (
                                    <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
                                        <p className="text-sm text-slate-400">
                                            Belum ada batch untuk obat ini.
                                        </p>
                                    </div>
                                )}

                            </div>

                        </div>
                    )}

                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-end">

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Batal
                    </Button>

                    <Button
                        type="button"
                        onClick={handleSubmit}
                    >
                        {isEdit ? "Simpan Perubahan" : "Tambah Obat"}
                    </Button>

                </div>

            </DialogContent>

            {isEdit && item && (
                <OtcBatchModal
                    open={batchModalOpen}
                    onOpenChange={setBatchModalOpen}
                    itemId={item.id}
                    itemUnit={unit}
                    batch={selectedBatch}
                    onSaved={() => {
                        router.refresh();
                    }}
                />
            )}

        </Dialog>
    );
}