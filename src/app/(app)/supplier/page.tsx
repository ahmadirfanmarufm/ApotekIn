"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Supplier } from "@/types/supplier";
import { getSuppliers } from "./_actions/supplier-actions";
import { SupplierMetrics } from "@/components/supplier/supplier-metrics";
import { SupplierCard } from "@/components/supplier/supplier-card";
import { SupplierDialog } from "@/components/supplier/supplier-dialog";

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );

  const fetchSuppliers = useCallback(async () => {
    const res = await getSuppliers();
    if (res.success && res.data) {
      setSuppliers(res.data);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

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
        onSuccess={fetchSuppliers}
      />

      <div className="max-h-[calc(100vh-440px)] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onEdit={handleOpenEditDialog}
              onRefresh={fetchSuppliers}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
