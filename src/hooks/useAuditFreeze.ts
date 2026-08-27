"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface AuditFreezeActiveAudit {
  id: string;
  auditNumber: string;
  conductedById: string;
  broughtAt: string;
}

export interface UseAuditFreezeResult {
  isFreezeActive: boolean;
  loading: boolean;
  error: string | null;
  activeAudit: AuditFreezeActiveAudit | null;
  refetch: () => void;
}

interface AuditStatusEnvelope {
  success: boolean;
  isFreezeActive?: boolean;
  activeAudit?: AuditFreezeActiveAudit | null;
  message?: string;
}

const POLL_INTERVAL_MS = 15_000;

export function useAuditFreeze(): UseAuditFreezeResult {
  const [isFreezeActive, setIsFreezeActive] = useState(false);
  const [activeAudit, setActiveAudit] = useState<AuditFreezeActiveAudit | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchStatus = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      const res = await fetch("/api/audit/status", { cache: "no-store" });
      const json = (await res.json()) as AuditStatusEnvelope;

      if (requestIdRef.current !== requestId) {
        return;
      }

      if (!json.success) {
        throw new Error(json.message ?? "Gagal memuat status audit.");
      }

      setIsFreezeActive(Boolean(json.isFreezeActive));
      setActiveAudit(json.activeAudit ?? null);
      setError(null);
    } catch (err) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memuat status audit.",
      );
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    const intervalId = window.setInterval(fetchStatus, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      requestIdRef.current += 1;
    };
  }, [fetchStatus]);

  return {
    isFreezeActive,
    loading,
    error,
    activeAudit,
    refetch: fetchStatus,
  };
}
