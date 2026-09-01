"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteModal } from "@/components/inventory/ConfirmDeleteModal";
import type { NonMedicineInventoryItem } from "@/types/inventory";
import { NonMedicineItemModal } from "@/components/inventory/NonMedicineItemModal";
import { NonMedicineInventoryCard } from "@/components/inventory/NonMedicineCard";

function NonMedicineSkeleton() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-200" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 animate-pulse rounded-xl bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-1/4 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NonMedicineInventoryPage() {
  const [items, setItems] = useState<NonMedicineInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/inventory/nonmedicine", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal mengambil data non obat.");
      }

      setItems(data.data ?? []);
    } catch (err) {
      console.error("LOAD NON MEDICINE ITEMS ERROR:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memuat data.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const selectedItem = items.find((item) => item.id === selectedItemId) ?? null;

  const handleAdd = () => {
    setSelectedItemId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: NonMedicineInventoryItem) => {
    setSelectedItemId(item.id);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (item: any) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch(
        `/api/inventory/nonmedicine/${itemToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus non obat.");
      }

      setDeleteModalOpen(false);
      setItemToDelete(null);
      void loadItems();
    } catch (err) {
      console.error("DELETE NON MEDICINE ERROR:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghapus non obat.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <NonMedicineSkeleton />;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-manrope text-2xl font-bold text-slate-950">
            Non Obat
          </h1>
          <p className="mt-1 text-slate-500">
            Kelola stok barang non-obat berdasarkan batch dan tanggal
            kedaluwarsa
          </p>
        </div>
        <Button onClick={handleAdd} className="w-full sm:w-auto">
          <Plus size={18} />
          Tambah Barang
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
          <p className="text-slate-500">Belum ada data non obat.</p>
          <Button onClick={handleAdd} className="mt-4">
            <Plus size={18} />
            Tambah Barang Pertama
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {items.map((item) => (
            <NonMedicineInventoryCard
              key={item.id}
              item={item}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDeleteClick(item)}
            />
          ))}
        </div>
      )}

      <NonMedicineItemModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        item={selectedItem}
        onSuccess={() => {
          void loadItems();
        }}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        itemName={itemToDelete?.name}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />
    </div>
  );
}
