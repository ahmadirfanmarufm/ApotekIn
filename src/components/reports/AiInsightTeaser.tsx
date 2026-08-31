"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function AiInsightTeaser() {
  const [headline, setHeadline] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/insights", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.success) {
          setHeadline(json.data.result.headline);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  if (!headline) return null;

  return (
    <Link
      href="/ai-insights"
      className="group flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5 shadow-sm transition-colors hover:bg-violet-50 sm:p-4"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
        <Sparkles className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-violet-500">
          Ringkasan AI
        </p>

        <p className="mt-0.5 line-clamp-2 text-sm font-medium leading-relaxed text-slate-700 sm:line-clamp-1">
          {headline}
        </p>
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 text-violet-400 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}