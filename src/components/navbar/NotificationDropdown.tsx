"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Notification, NotificationListResponse } from "@/types/navbar";
import { NotificationItem } from "./NotificationItem";

const POLL_INTERVAL_MS = 60_000;

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      const json: NotificationListResponse = await res.json();
      if (json.success) {
        setNotifications(json.data);
        setUnreadCount(json.unreadCount);
      }
    } catch (error) {
      console.error("[NotificationDropdown] fetch failed", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (error) {
      console.error("[NotificationDropdown] markRead failed", error);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
      );
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (unreadCount === 0 || isMutating) return;
    setIsMutating(true);

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    const previousUnread = unreadCount;
    setUnreadCount(0);

    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (error) {
      console.error("[NotificationDropdown] markAllRead failed", error);
      setUnreadCount(previousUnread);
      fetchNotifications();
    } finally {
      setIsMutating(false);
    }
  }, [unreadCount, isMutating, fetchNotifications]);

  const handleOpen = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) fetchNotifications();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Notifikasi"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={handleOpen}
        className={`relative rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-600 ${
          isOpen ? "bg-slate-100 text-slate-700" : ""
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
          <span className="absolute -top-0.5 -right-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed left-1/2 top-16 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-3 sm:w-120 sm:max-w-none sm:translate-x-0">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Notifikasi
              </h3>
              <p className="text-xs text-slate-500">
                {unreadCount > 0
                  ? `Kamu punya ${unreadCount} notifikasi baru`
                  : "Tidak ada notifikasi baru"}
              </p>
            </div>

            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || isMutating}
              className="text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-700 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              Tandai semua
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                Memuat notifikasi...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markAsRead}
                  onNavigate={() => setIsOpen(false)}
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
            <a
              href="/notifications"
              className="block w-full text-center text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
            >
              Lihat semua notifikasi
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
