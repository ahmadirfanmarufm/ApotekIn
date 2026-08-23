"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    CompoundInventoryCard,
    CompoundInventoryItem,
} from "./CompoundInventoryCard";

import { CompoundItemModal } from "./CompoundItemModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

interface CompoundInventoryClientProps {
    items: CompoundInventoryItem[];
}

export function CompoundInventoryClient({
    items,
}: CompoundInventoryClientProps) {
    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [selectedItem, setSelectedItem] = useState<CompoundInventoryItem | null>(null);

    const [deleteModalOpen, setDeleteModalOpen] =
        useState(false);

    const [itemToDelete, setItemToDelete] =
        useState<CompoundInventoryItem | null>(null);

    const handleAdd = () => {
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (
        item: CompoundInventoryItem
    ) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = (
        item: CompoundInventoryItem
    ) => {
        setItemToDelete(item);
        setDeleteModalOpen(true);
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-manrope text-3xl font-bold text-slate-950">
                        Bahan Racikan
                    </h1>

                    <p className="mt-1 text-slate-500">
                        Kelola persediaan bahan untuk
                        kebutuhan peracikan obat.
                    </p>
                </div>

                <Button
                    onClick={handleAdd}
                    className="w-full sm:w-auto"
                >
                    <Plus size={18} />
                    Tambah Bahan
                </Button>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {items.map((item) => (
                    <CompoundInventoryCard
                        key={item.id}
                        item={item}
                        onEdit={() =>
                            handleEdit(item)
                        }
                        onDelete={() =>
                            handleDelete(item)
                        }
                    />
                ))}
            </div>

            {/* Modal */}
            <CompoundItemModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                item={selectedItem}
            />

            {/* Delete */}
            <ConfirmDeleteModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                itemName={itemToDelete?.name}
                onConfirm={() => {}}
                loading={false}
            />
        </div>
    );
}