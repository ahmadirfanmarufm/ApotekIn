"use client";

import Link from "next/link";
import {
    Beaker,
    CalendarDays,
    ChevronRight,
    Pencil,
    ShoppingCart,
    Trash2,
} from "lucide-react";

export type CompoundInventoryItem = {
    id: string;
    name: string;
    code: string;
    unit: string;
    minStock: number;
    maxStock: number;
    description: string | null;
    batches: {
        id: string;
        batchNumber: string;
        quantity: number;
        initialQuantity: number;
        expiryDate: string;
        buyPrice: string;
        sellPrice: string;
    }[];
};

interface CompoundInventoryCardProps {
    item: CompoundInventoryItem;
    onEdit: () => void;
    onDelete: () => void;
}

const getDaysRemaining = (date: string) => {
    const expiry = new Date(date);
    const today = new Date();

    const diff = expiry.getTime() - today.getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export function CompoundInventoryCard({ item, onEdit, onDelete }: CompoundInventoryCardProps) {
    const totalStock = item.batches.reduce((total, batch) => total + batch.quantity, 0);

    const isCritical = totalStock <= item.minStock;

    const restockQuantity = Math.max(item.maxStock - totalStock, 0);

    const percentage = item.maxStock > 0 ? Math.min((totalStock / item.maxStock) * 100, 100) : 0;

    const activeBatches = item.batches.filter(
        (batch) => batch.quantity > 0
    );

    const nearestBatch = [...activeBatches].sort(
        (a, b) =>
            new Date(a.expiryDate).getTime() -
            new Date(b.expiryDate).getTime()
    )[0];

    const daysRemaining = nearestBatch
        ? getDaysRemaining(nearestBatch.expiryDate)
        : null;

    const recommendedRestock = Math.max(
        item.maxStock - totalStock,
        0
    );

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
            <div className="p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Beaker size={25} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <h2 className="font-manrope text-lg font-bold text-slate-900">
                                    {item.name}
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    {item.code}
                                </p>
                            </div>

                            <span
                                className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                                    isCritical
                                        ? "bg-red-50 text-red-600"
                                        : "bg-emerald-50 text-emerald-600"
                                }`}
                            >
                                {isCritical
                                    ? "Stok Kritis"
                                    : "Stok Normal"}
                            </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                                Bahan Racikan
                            </span>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                Satuan: {item.unit}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stock */}
                <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm text-slate-400">
                            Stok saat ini
                        </span>

                        <span className="font-bold text-slate-800">
                            {totalStock.toLocaleString("id-ID")}{" "}
                            {item.unit}
                        </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className={`h-full rounded-full transition-all ${
                                isCritical
                                    ? "bg-red-500"
                                    : "bg-emerald-500"
                            }`}
                            style={{
                                width: `${percentage}%`,
                            }}
                        />
                    </div>

                    <div className="mt-2 flex justify-between text-xs text-slate-400">
                        <span>
                            Min {item.minStock} {item.unit}
                        </span>

                        <span>
                            Max {item.maxStock} {item.unit}
                        </span>
                    </div>
                </div>

                {/* Summary */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                            Batch Aktif
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-800">
                            {activeBatches.length}
                        </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                            Exp. Terdekat
                        </p>

                        <p
                            className={`mt-1 text-sm font-bold ${
                                daysRemaining !== null &&
                                daysRemaining <= 90
                                    ? "text-red-500"
                                    : "text-slate-800"
                            }`}
                        >
                            {daysRemaining !== null
                                ? `${daysRemaining} hari`
                                : "-"}
                        </p>
                    </div>
                </div>

                {/* Nearest Batch */}
                {nearestBatch && (
                    <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-medium text-emerald-500">
                                    FEFO Priority
                                </p>

                                <p className="mt-1 text-sm font-bold text-slate-800">
                                    {nearestBatch.batchNumber}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                                <CalendarDays
                                    size={15}
                                    className="text-emerald-500"
                                />

                                <span
                                    className={
                                        daysRemaining !== null &&
                                        daysRemaining <= 90
                                            ? "font-semibold text-red-500"
                                            : "text-slate-500"
                                    }
                                >
                                    {formatDate(
                                        nearestBatch.expiryDate
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs">
                            <span className="text-slate-400">
                                Stok batch
                            </span>

                            <span className="font-semibold text-slate-700">
                                {nearestBatch.quantity.toLocaleString(
                                    "id-ID"
                                )}{" "}
                                {item.unit}
                            </span>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                    <Link
                        href={{
                        pathname: "/inventory/incoming",
                            query: {
                                itemId: item.id,
                                quantity: restockQuantity,
                                mode: "restock",
                            },
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-100"
                    >
                        <ShoppingCart size={16} />
                        Restock
                    </Link>
                    
                    <button
                        type="button"
                        onClick={onEdit}
                        className="inline-flex items-center hover:cursor-pointer gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                        <Pencil size={15} />
                        Edit
                    </button>

                    <button
                        type="button"
                        onClick={onDelete}
                        className="inline-flex items-center hover:cursor-pointer gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-100"
                    >
                        <Trash2 size={15} />
                        Hapus
                    </button>

                    <Link
                        href={`/inventory/compound/${item.id}`}
                        className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800"
                    >
                        Batch Detail
                        <ChevronRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}