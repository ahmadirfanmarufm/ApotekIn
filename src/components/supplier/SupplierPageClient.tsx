"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Loader2 } from "lucide-react";

import { Supplier } from "@/types/supplier";
import { SupplierMetrics } from "@/components/supplier/supplier-metrics";
import { SupplierCard } from "@/components/supplier/supplier-card";
import { SupplierDialog } from "@/components/supplier/supplier-dialog";
import { SupplierSearch } from "@/components/supplier/supplier-search";
import { useRouter } from "next/navigation";

const SEARCH_DEBOUNCE_MS = 300;

export default function SupplierPageClient() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();

    const loadSuppliers = async () => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams();
        if (debouncedSearch) {
          params.set("search", debouncedSearch);
        }

        const query = params.toString();
        const res = await fetch(
          query ? `/api/supplier?${query}` : "/api/supplier",
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          },
        );

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
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadSuppliers();

    return () => {
      controller.abort();
    };
  }, [refreshKey, debouncedSearch]);

  const handleOpenAddDialog = () => {
    setSelectedSupplier(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDialogOpen(true);
  };

  const handleCreatePo = (supplier: Supplier) => {
    router.push(`/purchase-order?supplierId=${supplier.id}`);
  };

  const totalDelivered = suppliers.reduce(
    (acc, item) => acc + item.Delivered,
    0,
  );

  return (
    <div className="relative space-y-6 font-inter text-slate-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-manrope text-2xl font-bold text-slate-950">
            Manajemen Supplier
          </h1>
          <p className="mt-1 text-slate-500">Kelola supplier apotek</p>
        </div>

        <Button
          onClick={handleOpenAddDialog}
          className="flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Tambah Supplier
        </Button>
      </div>

      <SupplierMetrics
        activeSuppliersCount={suppliers.length}
        totalDeliveredCount={totalDelivered}
      />

      <SupplierSearch value={searchInput} onChange={setSearchInput} />

      <SupplierDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        supplierToEdit={selectedSupplier}
        onSuccess={refresh}
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
          Memuat data supplier...
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex h-64 animate-pulse flex-col justify-between space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 shrink-0 rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="h-14 rounded-xl bg-slate-100" />
                <div className="h-14 rounded-xl bg-slate-100" />
                <div className="h-14 rounded-xl bg-slate-100" />
              </div>

              <div className="h-14 rounded-xl bg-slate-100" />

              <div className="flex items-center gap-2 pt-1">
                <div className="h-9 flex-1 rounded-md bg-slate-200" />
                <div className="h-9 w-9 rounded-md bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <EmptyState
          title={
            debouncedSearch ? "Supplier tidak ditemukan" : "Belum ada supplier"
          }
          description={
            debouncedSearch
              ? `Tidak ada supplier yang cocok dengan “${debouncedSearch}”.`
              : "Tambahkan supplier untuk mulai mengelola pengadaan."
          }
        />
      ) : (
        <div className="max-h-[calc(100vh-440px)] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                onEdit={handleOpenEditDialog}
                onCreatePo={handleCreatePo}
                onRefresh={refresh}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}