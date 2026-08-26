"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Beaker,
  CalendarDays,
  Clock3,
  Package,
  Pencil,
  ShoppingCart,
  Truck,
  AlertTriangle,
  Boxes,
} from "lucide-react";
import { useState } from "react";

export type CompoundBatchDetailItem = {
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
    buyPrice: number;
    sellPrice: number;

    stockOutItems: {
      id: string;
      quantity: number;
      unitPrice: number;
      createdAt: string;

      stockOut: {
        referenceNo: string;
        createdAt: string;
      };
    }[];
  }[];

  purchaseOrderItems: {
    id: string;
    batchNumber: string;
    quantity: number;
    expiryDate: string;
    unitPrice: number;
    createdAt: string;

    purchaseOrder: {
      id: string;
      poNumber: string;
      status: string;
      receivedAt: string | null;
      createdAt: string;

      supplier: {
        id: string;
        name: string;
        code: string;
      };
    };
  }[];
};

interface CompoundBatchDetailProps {
  item: CompoundBatchDetailItem;
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

const getDaysRemaining = (date: string) => {
  const expiry = new Date(date);
  const today = new Date();

  const diff = expiry.getTime() - today.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export function CompoundBatchDetail({ item }: CompoundBatchDetailProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const totalStock = item.batches.reduce(
    (total, batch) => total + batch.quantity,
    0,
  );

  const critical = totalStock <= item.minStock;

  const stockPercentage =
    item.maxStock > 0 ? Math.min((totalStock / item.maxStock) * 100, 100) : 0;

  const activeBatches = item.batches.filter((batch) => batch.quantity > 0);

  const fefoBatch = activeBatches[0];

  const nearExpiryCount = activeBatches.filter((batch) => {
    const days = getDaysRemaining(batch.expiryDate);

    return days >= 0 && days <= 90;
  }).length;

  const expiredCount = item.batches.filter(
    (batch) => getDaysRemaining(batch.expiryDate) < 0,
  ).length;

  const totalStockOut = item.batches.reduce(
    (total, batch) =>
      total +
      batch.stockOutItems.reduce(
        (sum, transaction) => sum + transaction.quantity,
        0,
      ),
    0,
  );

  const recommendedRestock = Math.max(item.maxStock - totalStock, 0);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Link
            href="/inventory/compound"
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-manrope text-2xl font-bold text-slate-950 sm:text-2xl">
                {item.name}
              </h1>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  critical
                    ? "bg-red-50 text-red-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {critical ? "Stok Kritis" : "Stok Normal"}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <span>{item.code}</span>

              <span className="text-slate-300">•</span>

              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
                Bahan Racikan
              </span>

              <span className="text-slate-300">•</span>

              <span>{item.unit}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/inventory/incoming?itemId=${item.id}&quantity=${recommendedRestock}&mode=restock`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            <ShoppingCart size={16} />
            Restock
          </Link>

          <button
            type="button"
            onClick={() => handleEdit(item)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <Pencil size={16} />
            Edit
          </button>
        </div>
      </div>

      {item.description && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Beaker size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Deskripsi Bahan
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Stok</p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totalStock.toLocaleString("id-ID")}
              </p>

              <p className="mt-1 text-xs text-slate-400">{item.unit}</p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Beaker size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Batch Aktif</p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {activeBatches.length}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                dari {item.batches.length} batch
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Boxes size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Mendekati Expired</p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {nearExpiryCount}
              </p>

              <p className="mt-1 text-xs text-slate-400">Dalam 90 hari</p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock3 size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Stok Terpakai</p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totalStockOut.toLocaleString("id-ID")}
              </p>

              <p className="mt-1 text-xs text-slate-400">{item.unit}</p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Package size={21} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-400">
                Kondisi Persediaan
              </p>

              <h2 className="mt-1 font-manrope text-xl font-bold text-slate-900">
                Stok bahan saat ini
              </h2>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-2xl font-bold text-slate-900">
                {totalStock.toLocaleString("id-ID")}
              </p>

              <p className="text-xs text-slate-400">
                Maksimum {item.maxStock.toLocaleString("id-ID")} {item.unit}
              </p>
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${
                critical ? "bg-red-500" : "bg-amber-500"
              }`}
              style={{
                width: `${stockPercentage}%`,
              }}
            />
          </div>

          <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-slate-400">
            <span>
              Minimum {item.minStock} {item.unit}
            </span>

            <span>
              Maksimum {item.maxStock} {item.unit}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
              <CalendarDays size={19} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                FEFO
              </p>

              <h2 className="mt-1 font-manrope text-lg font-bold text-slate-900">
                Prioritas Penggunaan
              </h2>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            Gunakan bahan dengan tanggal kedaluwarsa paling dekat terlebih
            dahulu untuk mengurangi risiko bahan terbuang.
          </p>

          <div className="mt-4 rounded-xl border border-amber-100 bg-white p-3">
            <p className="text-xs text-slate-400">Batch prioritas</p>

            {fefoBatch ? (
              <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  {fefoBatch.batchNumber}
                </span>

                <span className="text-xs font-semibold text-amber-600">
                  {getDaysRemaining(fefoBatch.expiryDate)} hari lagi
                </span>
              </div>
            ) : (
              <p className="mt-1 text-sm text-slate-500">
                Tidak ada batch aktif.
              </p>
            )}
          </div>
        </div>
      </div>

      {(critical || nearExpiryCount > 0 || expiredCount > 0) && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-500">
              <AlertTriangle size={20} />
            </div>

            <div className="min-w-0">
              <h2 className="font-semibold text-red-700">
                Perhatian Persediaan
              </h2>

              <div className="mt-2 space-y-1 text-sm leading-6 text-red-600">
                {critical && (
                  <p>• Stok bahan berada pada atau di bawah batas minimum.</p>
                )}

                {nearExpiryCount > 0 && (
                  <p>
                    • Ada {nearExpiryCount} batch yang mendekati kedaluwarsa.
                  </p>
                )}

                {expiredCount > 0 && (
                  <p>• Ada {expiredCount} batch yang sudah kedaluwarsa.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-manrope text-xl font-bold text-slate-900">
              Batch Bahan
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Urutan bahan berdasarkan tanggal kedaluwarsa untuk membantu FEFO.
            </p>
          </div>

          <span className="text-xs font-medium text-slate-400">
            {item.batches.length} batch
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {item.batches.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-5 text-center">
              <p className="text-sm text-slate-400">
                Belum ada batch untuk bahan ini.
              </p>
            </div>
          ) : (
            item.batches.map((batch, index) => {
              const daysRemaining = getDaysRemaining(batch.expiryDate);

              const percentage =
                batch.initialQuantity > 0
                  ? Math.min(
                      (batch.quantity / batch.initialQuantity) * 100,
                      100,
                    )
                  : 0;

              const isFefo = batch.id === fefoBatch?.id && batch.quantity > 0;

              const isExpired = daysRemaining < 0;

              const isNearExpiry = daysRemaining >= 0 && daysRemaining <= 90;

              return (
                <div
                  key={batch.id}
                  className={`rounded-2xl border p-4 transition sm:p-5 ${
                    isExpired
                      ? "border-red-200 bg-red-50/40"
                      : isFefo
                        ? "border-amber-200 bg-amber-50/40"
                        : "border-slate-100 bg-slate-50/60"
                  }`}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                          isExpired
                            ? "bg-red-500 text-white"
                            : isFefo
                              ? "bg-amber-500 text-white"
                              : "bg-white text-slate-500"
                        }`}
                      >
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="break-all font-semibold text-slate-800">
                            {batch.batchNumber}
                          </p>

                          {isFefo && (
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700">
                              FEFO
                            </span>
                          )}

                          {isExpired && (
                            <span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-bold text-red-700">
                              EXPIRED
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                          Masuk {batch.initialQuantity.toLocaleString("id-ID")}{" "}
                          {item.unit}
                        </p>
                      </div>
                    </div>

                    <div className="w-full lg:w-52">
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="text-slate-400">Stok tersisa</span>

                        <span className="font-semibold text-slate-700">
                          {batch.quantity.toLocaleString("id-ID")} {item.unit}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white">
                        <div
                          className={`h-full rounded-full ${
                            isExpired
                              ? "bg-red-400"
                              : isFefo
                                ? "bg-amber-500"
                                : "bg-slate-400"
                          }`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 lg:w-52 lg:justify-end">
                      <CalendarDays
                        size={17}
                        className={
                          isExpired || isNearExpiry
                            ? "text-red-500"
                            : "text-slate-400"
                        }
                      />

                      <div className="text-left lg:text-right">
                        <p className="text-xs text-slate-400">Kedaluwarsa</p>

                        <p
                          className={`text-sm font-semibold ${
                            isExpired || isNearExpiry
                              ? "text-red-500"
                              : "text-slate-700"
                          }`}
                        >
                          {formatDate(batch.expiryDate)}
                        </p>

                        <p
                          className={`text-xs ${
                            isExpired || isNearExpiry
                              ? "text-red-500"
                              : "text-slate-400"
                          }`}
                        >
                          {isExpired
                            ? `Expired ${Math.abs(daysRemaining)} hari lalu`
                            : `${daysRemaining} hari lagi`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-200/70 pt-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-white/70 p-3">
                      <span className="text-xs text-slate-400">
                        Harga beli / {item.unit}
                      </span>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {formatCurrency(batch.buyPrice)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/70 p-3">
                      <span className="text-xs text-slate-400">Nilai stok</span>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {formatCurrency(batch.quantity * batch.buyPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-manrope text-lg font-bold text-slate-900">
              Riwayat Stok Masuk
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Riwayat penerimaan bahan dari supplier.
            </p>
          </div>

          <Truck size={20} className="shrink-0 text-slate-400" />
        </div>

        <div className="mt-5 space-y-3">
          {item.purchaseOrderItems.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-400">
              Belum ada riwayat stok masuk.
            </p>
          ) : (
            item.purchaseOrderItems.map((po) => (
              <div
                key={po.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {po.purchaseOrder.poNumber}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {po.purchaseOrder.supplier.name}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                    {po.purchaseOrder.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-400 sm:grid-cols-3">
                  <span>Batch {po.batchNumber}</span>

                  <span>
                    +{po.quantity.toLocaleString("id-ID")} {item.unit}
                  </span>

                  <span className="sm:text-right">
                    {formatCurrency(po.unitPrice)} / {item.unit}
                  </span>
                </div>

                <div className="mt-2 text-xs text-slate-400">
                  {formatDate(po.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-manrope text-lg font-bold text-slate-900">
              Riwayat Stok Keluar
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Penggunaan bahan untuk proses racikan atau transaksi lainnya.
            </p>
          </div>

          <Package size={20} className="shrink-0 text-slate-400" />
        </div>

        <div className="mt-5 space-y-3">
          {item.batches.flatMap((batch) =>
            batch.stockOutItems.map((transaction) => ({
              ...transaction,
              batchNumber: batch.batchNumber,
            })),
          ).length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-400">
              Belum ada riwayat stok keluar.
            </p>
          ) : (
            item.batches
              .flatMap((batch) =>
                batch.stockOutItems.map((transaction) => ({
                  ...transaction,
                  batchNumber: batch.batchNumber,
                })),
              )
              .map((transaction) => (
                <div
                  key={transaction.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {transaction.stockOut.referenceNo}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Batch {transaction.batchNumber}
                      </p>
                    </div>

                    <span className="w-fit font-semibold text-red-500">
                      -{transaction.quantity.toLocaleString("id-ID")}{" "}
                      {item.unit}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-slate-400">
                    <span>{formatDate(transaction.createdAt)}</span>

                    <span>
                      {formatCurrency(transaction.unitPrice)} / {item.unit}
                    </span>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
