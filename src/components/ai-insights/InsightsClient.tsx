"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, RefreshCw, ArrowLeft, Settings, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { InsightResponse } from "@/types/insight";

import { ExecutiveSummaryCard } from "./ExecutiveSummaryCard";
import { RisksCard } from "./RisksCard";
import { OpportunitiesCard } from "./OpportunitiesCard";
import { StockRecommendationsTable } from "./StockRecommendationsTable";
import { ForecastAndSupplierCard } from "./ForecastAndSupplierCard";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className}`} />;
}

function timeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;

  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export function InsightsClient() {
  const [data, setData] = useState<InsightResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/insights", { cache: "no-store" });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw { message: result.message ?? "Gagal memuat AI insight.", code: result.code };
      }

      setData(result.data);
    } catch (err) {
      const e = err as { message?: string; code?: string };
      setError({ message: e.message ?? "Terjadi kesalahan.", code: e.code });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const regenerate = useCallback(async () => {
    try {
      setIsRegenerating(true);
      setError(null);

      const response = await fetch("/api/insights", { method: "POST" });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw { message: result.message ?? "Gagal membuat ulang insight.", code: result.code };
      }

      setData(result.data);
    } catch (err) {
      const e = err as { message?: string; code?: string };
      setError({ message: e.message ?? "Terjadi kesalahan.", code: e.code });
    } finally {
      setIsRegenerating(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Sparkles className="h-4 w-4 shrink-0 text-violet-500" />
          {data ? (
            <span>
              Diperbarui <strong className="text-slate-700">{timeAgo(data.generatedAt)}</strong>
              {data.cached && " (cache)"}
            </span>
          ) : (
            <span>Memuat status...</span>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/reports">
            <Button variant="outline" className="w-full border-slate-200 bg-white shadow-sm sm:w-auto">
              Lihat Data Lengkap di Reports
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <Button
            onClick={() => void regenerate()}
            disabled={isRegenerating || isLoading}
            className="bg-violet-500 text-white shadow-sm hover:bg-violet-600"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
            {isRegenerating ? "Membuat ulang..." : "Buat Ulang Insight"}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4 sm:space-y-6" aria-busy="true">
          <SkeletonBlock className="h-56" />
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            <SkeletonBlock className="h-64" />
            <SkeletonBlock className="h-64" />
          </div>
          <SkeletonBlock className="h-72" />
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-400" />
          <p className="font-semibold text-red-600">Gagal memuat AI Insight</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-red-500">{error.message}</p>

          {error.code === "GEMINI_NOT_CONFIGURED" && (
            <div className="mx-auto mt-4 max-w-md rounded-xl border border-red-200 bg-white p-4 text-left text-xs text-slate-600">
              <p className="mb-2 flex items-center gap-1.5 font-bold text-slate-700">
                <Settings className="h-3.5 w-3.5" />
                Cara mengaktifkan (gratis, tanpa kartu kredit):
              </p>
              <ol className="list-decimal space-y-1 pl-4">
                <li>
                  Buka{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-blue-600 underline"
                  >
                    aistudio.google.com/app/apikey
                  </a>
                </li>
                <li>Login dengan akun Google, klik &quot;Create API key&quot;</li>
                <li>
                  Tambahkan <code className="rounded bg-slate-100 px-1">GEMINI_API_KEY=...</code>{" "}
                  di file <code className="rounded bg-slate-100 px-1">.env</code>
                </li>
                <li>Restart server development Anda</li>
              </ol>
            </div>
          )}

          <button
            onClick={() => void load()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>
        </div>
      )}

      {!isLoading && !error && data && (
        <div className="space-y-4 sm:space-y-6">
          <ExecutiveSummaryCard result={data.result} snapshot={data.digestSnapshot} />

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            <RisksCard risks={data.result.risks} />
            <OpportunitiesCard opportunities={data.result.opportunities} />
          </div>

          <StockRecommendationsTable recommendations={data.result.stockRecommendations} />

          <ForecastAndSupplierCard
            forecast={data.result.forecast}
            supplierNote={data.result.supplierNote}
          />

          <p className="text-center text-[11px] leading-relaxed text-slate-400">
            Insight ini dihasilkan oleh AI (Gemini) berdasarkan data operasional Anda dan
            bisa saja tidak sepenuhnya akurat. Selalu verifikasi sebelum mengambil
            keputusan penting.
          </p>
        </div>
      )}
    </div>
  );
}
