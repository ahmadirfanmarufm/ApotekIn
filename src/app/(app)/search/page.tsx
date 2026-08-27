"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Pill, FlaskConical, Package, ChevronRight, Loader2, ArrowLeft } from "lucide-react";

interface SearchItem {
  id: string;
  name: string;
  code: string;
  category: string;
  categoryLabel: string;
  unit: string;
  description: string | null;
  imageUrl: string | null;
  minStock: number;
  maxStock: number;
  totalStock: number;
  batchCount: number;
  detailUrl: string;
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default function SearchPage(props: SearchPageProps) {
  const searchParams = use(props.searchParams);
  const initialQuery = searchParams.q || "";

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<"ALL" | "OBAT_OTC" | "BAHAN_RACIKAN" | "NON_OBAT">("ALL");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (!query.trim()) {
      setItems([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const json = await res.json();
        if (json.success && json.data) {
          setItems(json.data.all || []);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error("Search page fetch error:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const filteredItems = items.filter((item) => {
    if (activeTab === "ALL") return true;
    return item.category === activeTab;
  });

  const countOtc = items.filter((i) => i.category === "OBAT_OTC").length;
  const countCompound = items.filter((i) => i.category === "BAHAN_RACIKAN").length;
  const countNonMed = items.filter((i) => i.category === "NON_OBAT").length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Dashboard
            </Link>
          </div>
          <h1 className="font-manrope text-2xl font-bold text-slate-950">
            Halaman Pencarian Inventaris
          </h1>
          <p className="text-sm text-slate-500">
            Cari obat OTC, resep/racikan, dan barang non-obat untuk mengakses batch detail secara langsung
          </p>
        </div>
      </div>

      {/* Search Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik nama obat, kode barang, atau deskripsi..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all shadow-inner"
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 animate-spin" />
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === "ALL"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua ({items.length})
          </button>
          <button
            onClick={() => setActiveTab("OBAT_OTC")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === "OBAT_OTC"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            <Pill className="h-3.5 w-3.5" />
            Obat OTC ({countOtc})
          </button>
          <button
            onClick={() => setActiveTab("BAHAN_RACIKAN")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === "BAHAN_RACIKAN"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100"
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Resep / Racikan ({countCompound})
          </button>
          <button
            onClick={() => setActiveTab("NON_OBAT")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === "NON_OBAT"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            <Package className="h-3.5 w-3.5" />
            Non Obat ({countNonMed})
          </button>
        </div>
      </div>

      {/* Results Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
          <p className="text-sm font-medium">Memuat hasil pencarian...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
          <p className="text-base font-semibold text-slate-700">
            {query.trim()
              ? `Tidak ditemukan barang untuk "${query}"`
              : "Silakan ketik kata kunci untuk memulai pencarian"}
          </p>
          <p className="text-xs text-slate-400">
            Coba gunakan kata kunci seperti nama obat, obat racikan, atau peralatan non-obat.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isCritical = item.totalStock <= item.minStock;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {item.categoryLabel}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isCritical
                              ? "bg-red-50 text-red-600 border border-red-100"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          }`}
                        >
                          {isCritical ? "Kritis" : "Stok Aman"}
                        </span>
                      </div>
                      <h3 className="font-manrope text-base font-bold text-slate-900 mt-1 truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">Kode: {item.code}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Stok:</span>
                      <span className="font-bold text-slate-800">
                        {item.totalStock.toLocaleString("id-ID")} {item.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Jumlah Batch:</span>
                      <span className="font-semibold text-slate-700">{item.batchCount} Batch</span>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 pt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <Link
                    href={item.detailUrl}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-green-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    Buka Batch Detail
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
