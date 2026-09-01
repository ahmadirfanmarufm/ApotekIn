"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Loader2,
  Pill,
  FlaskConical,
  Package,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface SearchItem {
  id: string;
  name: string;
  code: string;
  category: string;
  categoryLabel: string;
  unit: string;
  totalStock: number;
  batchCount: number;
  detailUrl: string;
}

interface SearchResults {
  otc: SearchItem[];
  compound: SearchItem[];
  nonmedicine: SearchItem[];
  all: SearchItem[];
}

export function SearchInput() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`,
        );
        const json = await res.json();
        if (json.success) {
          setResults(json.data);
        } else {
          setResults(null);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (detailUrl: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(detailUrl);
  };

  const hasResults =
    results &&
    (results.otc.length > 0 ||
      results.compound.length > 0 ||
      results.nonmedicine.length > 0);

  return (
    <>
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3 sm:px-4 py-2 w-full text-sm text-slate-400 flex items-center justify-between transition-all shadow-sm group"
        >
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <Search className="h-4 w-4 text-slate-400 group-hover:text-green-600 transition-colors shrink-0" />
            <span className="text-slate-500 truncate hidden xs:inline sm:inline">
              Cari obat OTC, resep/racikan, atau non-obat...
            </span>
            <span className="text-slate-500 sm:hidden">Cari...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 shadow-xs shrink-0">
            CTRL + K
          </kbd>
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200 bg-white">
              <Search className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Cari obat OTC, resep/racikan, atau non-obat..."
                className="w-full text-base font-medium text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
              />
              {loading ? (
                <Loader2 className="h-5 w-5 text-green-500 animate-spin shrink-0 ml-2" />
              ) : (
                query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setResults(null);
                    }}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors mr-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="hidden sm:inline-flex text-[11px] font-semibold text-slate-400 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors"
              >
                ESC
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
              {loading && !results && (
                <div className="p-8 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                  Mencari data inventaris...
                </div>
              )}

              {!loading && !hasResults && query.trim() && (
                <div className="p-10 text-center text-sm text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">
                    Tidak ada hasil ditemukan
                  </p>
                  <p className="text-xs text-slate-400">
                    Tidak ada barang yang cocok dengan kata kunci &ldquo;
                    <span className="text-slate-700">{query}</span>&rdquo;
                  </p>
                </div>
              )}

              {!loading && !query.trim() && (
                <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                  <p className="font-medium text-slate-500">
                    Ketik kata kunci untuk mulai mencari
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Sistem akan mencari obat OTC, resep/racikan, dan non-obat
                    secara langsung.
                  </p>
                </div>
              )}

              {results && (
                <>
                  {results.otc.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Pill className="h-3.5 w-3.5 text-emerald-600" />
                        Obat OTC
                      </div>
                      {results.otc.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item.detailUrl)}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-emerald-50/70 transition-colors flex items-center justify-between group my-0.5"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                              {item.name}
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600" />
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Kode: {item.code} • Stok:{" "}
                              <span className="font-medium text-slate-600">
                                {item.totalStock} {item.unit}
                              </span>{" "}
                              ({item.batchCount} Batch)
                            </p>
                          </div>
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-100/70 text-emerald-700 border border-emerald-200/60 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            Buka Batch Detail &rarr;
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {results.compound.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FlaskConical className="h-3.5 w-3.5 text-purple-600" />
                        Resep / Racikan
                      </div>
                      {results.compound.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item.detailUrl)}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-purple-50/70 transition-colors flex items-center justify-between group my-0.5"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-800 group-hover:text-purple-700 transition-colors flex items-center gap-1.5">
                              {item.name}
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-purple-600" />
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Kode: {item.code} • Stok:{" "}
                              <span className="font-medium text-slate-600">
                                {item.totalStock} {item.unit}
                              </span>{" "}
                              ({item.batchCount} Batch)
                            </p>
                          </div>
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-purple-100/70 text-purple-700 border border-purple-200/60 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            Buka Batch Detail &rarr;
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {results.nonmedicine.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 text-amber-600" />
                        Non Obat
                      </div>
                      {results.nonmedicine.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item.detailUrl)}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-amber-50/70 transition-colors flex items-center justify-between group my-0.5"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-800 group-hover:text-amber-700 transition-colors flex items-center gap-1.5">
                              {item.name}
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-amber-600" />
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Kode: {item.code} • Stok:{" "}
                              <span className="font-medium text-slate-600">
                                {item.totalStock} {item.unit}
                              </span>{" "}
                              ({item.batchCount} Batch)
                            </p>
                          </div>
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-100/70 text-amber-700 border border-amber-200/60 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                            Buka Batch Detail &rarr;
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {query.trim() && (
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Tekan{" "}
                  <kbd className="font-mono bg-white border rounded px-1">
                    Enter
                  </kbd>{" "}
                  untuk hasil lengkap
                </span>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push(
                      `/search?q=${encodeURIComponent(query.trim())}`,
                    );
                  }}
                  className="w-full sm:w-auto py-2 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-green-600 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  Buka Halaman Pencarian Lengkap
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
