"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import type { NonMedicineInventoryItem } from "@/types/inventory";
import { NonMedicineItemModal } from "./NonMedicineItemModal";
import { NonMedicineInventoryCard } from "./NonMedicineCard";

interface NonMedicineInventoryClientProps {
  items: NonMedicineInventoryItem[];
}

export function NonMedicineInventoryClient({
  items,
}: NonMedicineInventoryClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const [error, setError] = useState<string | null>(null);

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
    if (!itemToDelete) {
      return;
    }

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

      window.location.reload();
    } catch (error) {
      console.error("DELETE NON MEDICINE ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghapus non obat.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-manrope text-2xl font-bold text-slate-950">
            Non Obat
          </h1>

          <p className="mt-1 text-slate-500">
            Kelola stok obat bebas berdasarkan batch dan tanggal kedaluwarsa
          </p>
        </div>

        <Button onClick={handleAdd} className="w-full sm:w-auto">
          <Plus size={18} />
          Tambah Obat
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

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

      <NonMedicineItemModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        item={selectedItem}
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
