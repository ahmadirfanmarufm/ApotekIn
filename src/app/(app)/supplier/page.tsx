"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Supplier } from "@/types/supplier";
import { SupplierMetrics } from "@/components/supplier/supplier-metrics";
import { SupplierCard } from "@/components/supplier/supplier-card";
import { SupplierDialog } from "@/components/supplier/supplier-dialog";

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );

  /**
   * Digunakan untuk memicu refetch setelah:
   * - create
   * - update
   * - delete
   */
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadSuppliers = async () => {
      try {
        const res = await fetch("/api/supplier", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message ?? "Gagal mengambil data supplier.");
        }

        setSuppliers(json.data ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Failed to fetch suppliers:", error);
        setSuppliers([]);
      }
    };

    void loadSuppliers();

    return () => {
      controller.abort();
    };
  }, [refreshKey]);

  const handleOpenAddDialog = () => {
    setSelectedSupplier(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDialogOpen(true);
  };

  const totalDelivered = suppliers.reduce(
    (acc, item) => acc + item.Delivered,
    0,
  );

  return (
    <div className="relative space-y-6 font-inter text-slate-800">
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="font-manrope text-3xl font-bold text-slate-950">
            Manajemen Supplier
          </h1>
          <p className="mt-1 text-slate-500">Kelola supplier apotek</p>
        </div>

        <Button
          onClick={handleOpenAddDialog}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Supplier
        </Button>
      </div>

      <SupplierMetrics
        activeSuppliersCount={suppliers.length}
        totalDeliveredCount={totalDelivered}
      />

      <SupplierDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        supplierToEdit={selectedSupplier}
        onSuccess={refresh}
      />

      <div className="max-h-[calc(100vh-440px)] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onEdit={handleOpenEditDialog}
              onRefresh={refresh}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
