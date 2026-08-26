"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface DashboardApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface UseDashboardDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Shared client hook to fetch dashboard API endpoints
 * (e.g. /api/dashboard/health, /api/dashboard/financial?days=30, etc).
 *
 * Handles:
 * - Loading state on first fetch and during refetch
 * - Indonesian error messages from the API envelope
 * - Race-condition guard (only latest request wins)
 */
export function useDashboardData<T>(url: string): UseDashboardDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchData = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, { cache: "no-store" });
      const json = (await res.json()) as DashboardApiEnvelope<T>;

      // Ignore stale responses (a newer request already started)
      if (requestId !== requestIdRef.current) return;

      if (!res.ok || !json.success) {
        throw new Error(json.message ?? "Gagal memuat data.");
      }

      setData(json.data ?? null);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [url]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
