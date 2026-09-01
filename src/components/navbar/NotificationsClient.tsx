"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  Notification,
  NotificationListResponse,
  NotificationPriority,
  NotificationType,
} from "@/types/navbar";
import { NotificationItem } from "./NotificationItem";

const TYPE_OPTIONS: { value: "" | NotificationType; label: string }[] = [
  { value: "", label: "Semua Tipe" },
  { value: "CRITICAL_STOCK", label: "Stok Kritis" },
  { value: "EXPIRED_WARNING", label: "Kedaluwarsa" },
  { value: "ACTION_RECOMMENDATION", label: "Rekomendasi" },
  { value: "SYSTEM_INFO", label: "Sistem" },
  { value: "AUDIT_FREEZE", label: "Audit Freeze" },
];

const READ_OPTIONS: { value: "" | "true" | "false"; label: string }[] = [
  { value: "", label: "Semua Status" },
  { value: "false", label: "Belum Dibaca" },
  { value: "true", label: "Sudah Dibaca" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const priorityStyles: Record<NotificationPriority, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-slate-100 text-slate-600",
};

type FetchState = {
  data: Notification[];
  unreadCount: number;
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

const INITIAL_STATE: FetchState = {
  data: [],
  unreadCount: 0,
  page: 1,
  limit: 20,
  totalItems: 0,
  totalPages: 1,
};

export function NotificationsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.max(
    1,
    Math.min(100, parseInt(searchParams.get("limit") || "20", 10) || 20),
  );
  const typeFilter = (searchParams.get("type") || "") as "" | NotificationType;
  const readFilter = (searchParams.get("isRead") || "") as
    | ""
    | "true"
    | "false";
  const search = searchParams.get("q") || "";

  const [state, setState] = useState<FetchState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [searchInput, setSearchInput] = useState(search);

  const buildQueryString = useCallback(
    (overrides: Record<string, string | number | null>) => {
      const params = new URLSearchParams();
      const next: Record<string, string> = {
        page: String(page),
        limit: String(limit),
        type: typeFilter,
        isRead: readFilter,
        q: search,
      };
      for (const [key, value] of Object.entries(overrides)) {
        if (value === null || value === "" || value === undefined) {
          next[key] = "";
        } else {
          next[key] = String(value);
        }
      }
      for (const [key, value] of Object.entries(next)) {
        if (value) params.set(key, value);
      }
      return params.toString();
    },
    [page, limit, typeFilter, readFilter, search],
  );

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const qs = buildQueryString({});
      const res = await fetch(`/api/notifications?${qs}`, {
        cache: "no-store",
      });
      const json: NotificationListResponse = await res.json();
      if (json.success) {
        setState({
          data: json.data,
          unreadCount: json.unreadCount,
          page: json.pagination?.page ?? page,
          limit: json.pagination?.limit ?? limit,
          totalItems: json.pagination?.totalItems ?? json.data.length,
          totalPages: json.pagination?.totalPages ?? 1,
        });
      }
    } catch (error) {
      console.error("[NotificationsClient] fetch failed", error);
    } finally {
      setIsLoading(false);
    }
  }, [buildQueryString, page, limit]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const navigateWith = useCallback(
    (overrides: Record<string, string | number | null>) => {
      const qs = buildQueryString(overrides);
      router.push(qs ? `/notifications?${qs}` : "/notifications");
    },
    [buildQueryString, router],
  );

  const markAsRead = useCallback(
    async (id: string) => {
      setState((prev) => {
        let changed = false;
        const next = prev.data.map((n) => {
          if (n.id === id && !n.isRead) {
            changed = true;
            return { ...n, isRead: true };
          }
          return n;
        });
        return {
          ...prev,
          data: next,
          unreadCount: changed
            ? Math.max(0, prev.unreadCount - 1)
            : prev.unreadCount,
        };
      });

      try {
        const res = await fetch(`/api/notifications/${id}/read`, {
          method: "PATCH",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch (error) {
        console.error("[NotificationsClient] markRead failed", error);
        fetchNotifications();
      }
    },
    [fetchNotifications],
  );

  const markAllAsRead = useCallback(async () => {
    if (state.unreadCount === 0 || isMutating) return;
    setIsMutating(true);
    const previousUnread = state.unreadCount;
    setState((prev) => ({
      ...prev,
      unreadCount: 0,
      data: prev.data.map((n) => ({ ...n, isRead: true })),
    }));
    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (error) {
      console.error("[NotificationsClient] markAllRead failed", error);
      setState((prev) => ({ ...prev, unreadCount: previousUnread }));
      fetchNotifications();
    } finally {
      setIsMutating(false);
    }
  }, [state.unreadCount, isMutating, fetchNotifications]);

  const deleteAllRead = useCallback(async () => {
    const readCount = state.data.filter((n) => n.isRead).length;
    if (readCount === 0 || isMutating) return;
    if (!confirm("Hapus semua notifikasi yang sudah dibaca?")) return;
    setIsMutating(true);
    try {
      const res = await fetch("/api/notifications/delete-all", {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchNotifications();
    } catch (error) {
      console.error("[NotificationsClient] deleteAll failed", error);
    } finally {
      setIsMutating(false);
    }
  }, [state.data, isMutating, fetchNotifications]);

  const filteredCount = state.data.length;
  const startIndex =
    state.totalItems === 0 ? 0 : (state.page - 1) * state.limit + 1;
  const endIndex = Math.min(state.page * state.limit, state.totalItems);

  const summary = useMemo(() => {
    const parts: string[] = [];
    if (typeFilter) {
      const label = TYPE_OPTIONS.find((o) => o.value === typeFilter)?.label;
      if (label) parts.push(label);
    }
    if (readFilter === "true") parts.push("Sudah dibaca");
    else if (readFilter === "false") parts.push("Belum dibaca");
    if (search) parts.push(`"${search}"`);
    return parts.length > 0 ? parts.join(" • ") : "Semua notifikasi";
  }, [typeFilter, readFilter, search]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateWith({ q: searchInput.trim(), page: 1 });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard
          label="Total Notifikasi"
          value={state.totalItems}
          accent="slate"
        />
        <StatCard
          label="Belum Dibaca"
          value={state.unreadCount}
          accent={state.unreadCount > 0 ? "red" : "emerald"}
        />
        <StatCard
          label="Halaman"
          value={`${state.page} / ${state.totalPages}`}
          accent="slate"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full lg:max-w-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari judul atau pesan..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => navigateWith({ type: e.target.value, page: 1 })}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={readFilter}
              onChange={(e) =>
                navigateWith({ isRead: e.target.value, page: 1 })
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {READ_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={String(limit)}
              onChange={(e) =>
                navigateWith({ limit: Number(e.target.value), page: 1 })
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} / hal
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            {state.totalItems > 0
              ? `Menampilkan ${startIndex}-${endIndex} dari ${state.totalItems} • ${summary}`
              : summary}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={state.unreadCount === 0 || isMutating}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 font-medium text-emerald-600 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              Tandai semua dibaca
            </button>
            <button
              type="button"
              onClick={deleteAllRead}
              disabled={isMutating}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              Hapus yg dibaca
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="px-4 py-16 text-center text-sm text-slate-400">
            Memuat notifikasi...
          </div>
        ) : state.data.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto text-slate-300"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p className="mt-3 text-sm text-slate-500">
              Tidak ada notifikasi yang cocok dengan filter saat ini.
            </p>
          </div>
        ) : (
          <div>
            {state.data.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={markAsRead}
              />
            ))}
          </div>
        )}
      </div>

      {state.totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          <span>
            Halaman {state.page} dari {state.totalPages} • {filteredCount} item
            ditampilkan
          </span>
          <div className="flex items-center gap-1">
            <PageButton
              disabled={state.page <= 1}
              onClick={() => navigateWith({ page: state.page - 1 })}
            >
              ‹ Sebelumnya
            </PageButton>
            <PageNumbers
              current={state.page}
              total={state.totalPages}
              onSelect={(p) => navigateWith({ page: p })}
            />
            <PageButton
              disabled={state.page >= state.totalPages}
              onClick={() => navigateWith({ page: state.page + 1 })}
            >
              Berikutnya ›
            </PageButton>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
        <span className="font-medium text-slate-600">Prioritas:</span>
        <PriorityLegend label="Tinggi" style={priorityStyles.HIGH} />
        <PriorityLegend label="Sedang" style={priorityStyles.MEDIUM} />
        <PriorityLegend label="Rendah" style={priorityStyles.LOW} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: "slate" | "red" | "emerald";
}) {
  const accentMap: Record<typeof accent, string> = {
    slate: "border-slate-200",
    red: "border-red-200 bg-red-50/40",
    emerald: "border-emerald-200 bg-emerald-50/40",
  };
  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm ${accentMap[accent]}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
    >
      {children}
    </button>
  );
}

function PageNumbers({
  current,
  total,
  onSelect,
}: {
  current: number;
  total: number;
  onSelect: (page: number) => void;
}) {
  const pages: (number | "…")[] = [];
  const window = 1;

  for (let p = 1; p <= total; p++) {
    if (
      p === 1 ||
      p === total ||
      (p >= current - window && p <= current + window)
    ) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <>
      {pages.map((p, idx) =>
        p === "…" ? (
          <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onSelect(p)}
            className={`min-w-[32px] rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
              p === current
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {p}
          </button>
        ),
      )}
    </>
  );
}

function PriorityLegend({ label, style }: { label: string; style: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${style}`}
    >
      {label}
    </span>
  );
}
