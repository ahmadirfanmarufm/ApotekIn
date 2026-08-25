"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  Clock3,
  Package,
  Pencil,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { OtcItemModal } from "./OtcItemModal";
import { useState } from "react";

export type OtcBatchDetailItem = {
  id: string;
  name: string;
  code: string;
  unit: string;
  minStock: number;
  maxStock: number;
  imageUrl: string | null;
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

interface OtcBatchDetailProps {
  item: OtcBatchDetailItem;
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

export function OtcBatchDetail({ item }: OtcBatchDetailProps) {
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

  const stockPercentage = Math.min((totalStock / item.maxStock) * 100, 100);

  const activeBatches = item.batches.filter((batch) => batch.quantity > 0);

  const fefoBatch = activeBatches[0];

  const nearExpiryCount = activeBatches.filter(
    (batch) => getDaysRemaining(batch.expiryDate) <= 90,
  ).length;

  const totalSold = item.batches.reduce(
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
    <div className="space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/inventory/otc"
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
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

            <p className="mt-1 text-sm text-slate-400">
              {item.code} • Obat OTC
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/inventory/stok-masuk?itemId=${item.id}&quantity=${recommendedRestock}&mode=restock`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            <ShoppingCart size={16} />
            Restock
          </Link>

          <button
            type="button"
            onClick={() => handleEdit(item)}
            className="inline-flex items-center hover:cursor-pointer justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <Pencil size={16} />
            Edit
          </button>
        </div>
      </div>

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

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Package size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Jumlah Batch</p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {item.batches.length}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Batch aktif {activeBatches.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Package size={21} />
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
              <p className="text-sm text-slate-400">Stok Keluar</p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totalSold.toLocaleString("id-ID")}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Dari riwayat transaksi
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Truck size={21} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-400">
                Kondisi Persediaan
              </p>

              <h2 className="mt-1 font-manrope text-xl font-bold text-slate-900">
                Stok saat ini
              </h2>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-2xl font-bold text-slate-900">
                {totalStock.toLocaleString("id-ID")}
              </p>

              <p className="text-xs text-slate-400">
                Maksimum {item.maxStock.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${
                critical ? "bg-red-500" : "bg-emerald-500"
              }`}
              style={{
                width: `${stockPercentage}%`,
              }}
            />
          </div>

          <div className="mt-3 flex justify-between text-xs text-slate-400">
            <span>
              Minimum {item.minStock} {item.unit}
            </span>

            <span>
              Maksimum {item.maxStock} {item.unit}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
              ✦
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                AI Insight
              </p>

              <h2 className="mt-1 font-manrope text-lg font-bold text-slate-900">
                Rekomendasi Stok
              </h2>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            {critical
              ? `Stok ${item.name} berada di bawah batas minimum. Sistem menyarankan penambahan sekitar ${recommendedRestock.toLocaleString(
                  "id-ID",
                )} ${item.unit} untuk kembali ke stok maksimum.`
              : nearExpiryCount > 0
                ? `Terdapat ${nearExpiryCount} batch yang mendekati kedaluwarsa. Prioritaskan batch tersebut menggunakan FEFO sebelum melakukan restock.`
                : `Kondisi stok ${item.name} masih berada dalam batas aman. Belum ada kebutuhan restock mendesak.`}
          </p>

          <div className="mt-4 rounded-xl border border-emerald-100 bg-white p-3">
            <p className="text-xs text-slate-400">Prioritas FEFO</p>

            {fefoBatch ? (
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-700">
                  {fefoBatch.batchNumber}
                </span>

                <span className="text-xs font-semibold text-emerald-600">
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

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-manrope text-xl font-bold text-slate-900">
              Visualisasi Multi Batch
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Urutan batch berdasarkan tanggal kedaluwarsa untuk membantu
              penerapan FEFO.
            </p>
          </div>

          <span className="text-xs font-medium text-slate-400">
            {item.batches.length} batch
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {item.batches.map((batch, index) => {
            const daysRemaining = getDaysRemaining(batch.expiryDate);

            const percentage =
              batch.initialQuantity > 0
                ? Math.min((batch.quantity / batch.initialQuantity) * 100, 100)
                : 0;

            const isFefo = batch.id === fefoBatch?.id && batch.quantity > 0;

            const isExpired = daysRemaining < 0;

            const isNearExpiry = daysRemaining >= 0 && daysRemaining <= 90;

            return (
              <div
                key={batch.id}
                className={`rounded-2xl border p-4 transition sm:p-5 ${
                  isFefo
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-slate-100 bg-slate-50/60"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                        isFefo
                          ? "bg-emerald-500 text-white"
                          : "bg-white text-slate-500"
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-800">
                          {batch.batchNumber}
                        </p>

                        {isFefo && (
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">
                            FEFO PRIORITY
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
                          isFefo ? "bg-emerald-500" : "bg-slate-400"
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

                <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-200/70 pt-4 text-xs">
                  <div>
                    <span className="text-slate-400">Harga beli</span>

                    <p className="mt-1 font-semibold text-slate-700">
                      {formatCurrency(batch.buyPrice)}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400">Harga jual</span>

                    <p className="mt-1 font-semibold text-slate-700">
                      {formatCurrency(batch.sellPrice)}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400">Potensi nilai stok</span>

                    <p className="mt-1 font-semibold text-slate-700">
                      {formatCurrency(batch.quantity * batch.sellPrice)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-manrope text-lg font-bold text-slate-900">
                Riwayat Stok Masuk
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Riwayat penerimaan obat dari supplier.
              </p>
            </div>

            <Truck size={20} className="text-slate-400" />
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
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {po.purchaseOrder.poNumber}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {po.purchaseOrder.supplier.name}
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                      {po.purchaseOrder.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-slate-400">
                    <span>Batch {po.batchNumber}</span>

                    <span className="font-semibold text-slate-700">
                      +{po.quantity} {item.unit}
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between text-xs text-slate-400">
                    <span>{formatDate(po.createdAt)}</span>

                    <span>
                      {formatCurrency(po.unitPrice)} / {item.unit}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-manrope text-lg font-bold text-slate-900">
                Riwayat Stok Keluar
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Penggunaan dan transaksi obat.
              </p>
            </div>

            <Package size={20} className="text-slate-400" />
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
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {transaction.stockOut.referenceNo}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Batch {transaction.batchNumber}
                        </p>
                      </div>

                      <span className="font-semibold text-red-500">
                        -{transaction.quantity} {item.unit}
                      </span>
                    </div>

                    <div className="mt-3 flex justify-between text-xs text-slate-400">
                      <span>{formatDate(transaction.createdAt)}</span>

                      <span>{formatCurrency(transaction.unitPrice)}</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      <OtcItemModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        item={selectedItem}
      />
    </div>
  );
}
