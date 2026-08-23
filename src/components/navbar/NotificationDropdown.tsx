"use client";

import { useEffect, useRef, useState } from "react";
import { Notification } from "@/types/navbar";
import { NotificationItem } from "./NotificationItem";

const notifications: Notification[] = [
  {
    id: 1,
    title: "Stok hampir habis",
    message: "Stok Paracetamol tersisa 5 pcs.",
    time: "5 menit lalu",
    unread: true,
  },
  {
    id: 2,
    title: "Data inventaris diperbarui",
    message: "Inventaris berhasil diperbarui.",
    time: "1 jam lalu",
    unread: true,
  },
  {
    id: 3,
    title: "Resep baru ditambahkan",
    message: "Resep Ayam Teriyaki telah ditambahkan.",
    time: "Kemarin",
    unread: false,
  },
];

export function NotificationDropdown() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

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

  const unreadCount = notifications.filter((item) => item.unread).length;

  return (
    <div ref={notificationRef} className="relative">
      <button
        type="button"
        aria-label="Notifikasi"
        aria-expanded={isNotificationOpen}
        aria-haspopup="true"
        onClick={() => setIsNotificationOpen((prev) => !prev)}
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
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
        )}
      </button>

      {isNotificationOpen && (
        <div className="absolute right-0 top-full mt-3 w-120 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Notifikasi
              </h3>
              <p className="text-xs text-slate-500">
                Kamu punya {unreadCount} notifikasi baru
              </p>
            </div>

            <button
              type="button"
              className="text-xs font-medium text-green-600 hover:text-green-700"
            >
              Tandai semua
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
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
              className="w-full text-center text-sm font-medium text-green-600 hover:text-green-700"
            >
              Lihat semua notifikasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}