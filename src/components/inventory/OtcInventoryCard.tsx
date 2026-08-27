"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Pencil, ChevronRight, Trash2 } from "lucide-react";

type OtcInventoryItem = {
  id: string;
  name: string;
  code: string;
  unit: string;
  minStock: number;
  maxStock: number;
  imageUrl: string | null;
  batches: {
    id: string;
    batchNumber: string;
    quantity: number;
    initialQuantity: number;
    expiryDate: string;
  }[];
};

interface OtcInventoryCardProps {
  item: OtcInventoryItem;
  onEdit: () => void;
  onDelete: () => void;
}

export function OtcInventoryCard({
  item,
  onEdit,
  onDelete,
}: OtcInventoryCardProps) {
  const totalStock = item.batches.reduce(
    (total, batch) => total + batch.quantity,
    0,
  );

  const isCritical = totalStock <= item.minStock;

  const restockQuantity = Math.max(item.maxStock - totalStock, 0);

  const percentage =
    item.maxStock > 0 ? Math.min((totalStock / item.maxStock) * 100, 100) : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-contain p-2"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No Image
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-manrope text-lg font-bold text-slate-900">
                  {item.name}
                </h2>

                <p className="mt-1 text-sm text-slate-400">{item.code}</p>
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                  isCritical
                    ? "bg-red-50 text-red-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {isCritical ? "Kritis" : "Normal"}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                OTC
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-slate-400">Stok saat ini</span>

            <span className="font-bold text-slate-800">
              {totalStock.toLocaleString("id-ID")} {item.unit}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${
                isCritical ? "bg-red-500" : "bg-emerald-500"
              }`}
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Detail Batch
            </h3>

            <span className="text-xs text-slate-400">
              {item.batches.length} batch
            </span>
          </div>

          <div className="space-y-3">
            {item.batches.slice(0, 3).map((batch) => {
              const batchPercentage =
                batch.initialQuantity > 0
                  ? (batch.quantity / batch.initialQuantity) * 100
                  : 0;

              const expiry = new Date(batch.expiryDate);
              const today = new Date();

              const diff = expiry.getTime() - today.getTime();

              const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));

              const nearExpiry = daysRemaining <= 90;

              return (
                <div
                  key={batch.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                      <span className="text-sm font-semibold text-slate-700">
                        {batch.batchNumber}
                      </span>
                    </div>

                    <span className="text-sm font-semibold text-slate-700">
                      {batch.quantity.toLocaleString("id-ID")} {item.unit}
                    </span>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${Math.min(batchPercentage, 100)}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs">
                    <span className="text-slate-400">
                      Exp{" "}
                      {expiry.toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    <span
                      className={
                        nearExpiry
                          ? "font-semibold text-red-500"
                          : "text-slate-400"
                      }
                    >
                      {nearExpiry
                        ? `⚠ ${daysRemaining} hari`
                        : `${daysRemaining} hari lagi`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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
            className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            <Pencil size={15} />
            Edit
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-100"
          >
            <Trash2 size={15} />
            Hapus
          </button>

          <Link
            href={`/inventory/otc/${item.id}`}
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
