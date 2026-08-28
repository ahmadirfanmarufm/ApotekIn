"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Notification,
  NotificationCenterResponse,
} from "@/types/navbar";
import { NotificationItem } from "./NotificationItem";

const POLL_INTERVAL_MS = 60_000;

export function NotificationDropdown() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(
    async (showLoader = false): Promise<void> => {
      try {
        if (showLoader) setIsLoading(true);
        const res = await fetch("/api/notifications", {
          method: "GET",
          cache: "no-store",
        });
        const json = (await res.json()) as NotificationCenterResponse;
        if (!res.ok || !json.success || !json.data) {
          setErrorMessage(json.message ?? "Gagal memuat notifikasi.");
          return;
        }
        setErrorMessage(null);
        setNotifications(json.data.notifications);
        setUnreadCount(json.data.unreadCount);
      } catch (err) {
        console.error("[NotificationDropdown] fetch error:", err);
        setErrorMessage("Tidak dapat terhubung ke server.");
      } finally {
        if (showLoader) setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      void fetchNotifications(false);
    }, POLL_INTERVAL_MS);
    const initialFetch = window.setTimeout(() => {
      void fetchNotifications(false);
    }, 0);
    return () => {
      clearInterval(interval);
      window.clearTimeout(initialFetch);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOpen = () => {
    const next = !isNotificationOpen;
    setIsNotificationOpen(next);
    if (next) {
      void fetchNotifications(true);
    }
  };

  const handleMarkRead = useCallback(
    async (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        const res = await fetch(`/api/notifications/${id}/read`, {
          method: "PATCH",
        });
        if (!res.ok) {
          await fetchNotifications(false);
        }
      } catch (err) {
        console.error("[NotificationDropdown] mark-read error:", err);
        await fetchNotifications(false);
      }
    },
    [fetchNotifications],
  );

  const handleMarkAllRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    await Promise.all(
      unreadIds.map((id) =>
        fetch(`/api/notifications/${id}/read`, { method: "PATCH" }).catch(
          () => null,
        ),
      ),
    );

    await fetchNotifications(false);
  }, [notifications, fetchNotifications]);

  const unreadText =
    unreadCount > 0
      ? `Kamu punya ${unreadCount} notifikasi baru`
      : "Tidak ada notifikasi baru";

  return (
    <div ref={notificationRef} className="relative">
      <button
        type="button"
        aria-label="Notifikasi"
        aria-expanded={isNotificationOpen}
        aria-haspopup="true"
        onClick={handleOpen}
        className={`relative text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 ${
          isNotificationOpen ? "bg-slate-100 text-slate-700" : ""
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 border-2 border-white text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isNotificationOpen && (
        <div className="absolute right-0 top-full mt-3 w-120 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Notifikasi
              </h3>
              <p className="text-xs text-slate-500">{unreadText}</p>
            </div>

            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="text-xs font-medium text-green-600 hover:text-green-700 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              Tandai semua
            </button>
          </div>

          {errorMessage ? (
            <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">
              {errorMessage}
            </div>
          ) : null}

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-10 text-center text-xs text-slate-400">
                Memuat notifikasi...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                />
              ))
            ) : (
              <div className="px-4 py-10 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
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

                <p className="mt-2 text-sm text-slate-500">
                  Tidak ada notifikasi
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-3">
            <button
              type="button"
              onClick={() => {
                setIsNotificationOpen(false);
                void fetchNotifications(false);
              }}
              className="w-full text-center text-sm font-medium text-green-600 hover:text-green-700"
            >
              Refresh notifikasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}