"use client";

import { useRouter } from "next/navigation";
import type { Notification, NotificationPriority } from "@/types/navbar";

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

const priorityStyles: Record<NotificationPriority, string> = {
  HIGH: "bg-red-100 text-red-700 border-red-200",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
};

const priorityLabel: Record<NotificationPriority, string> = {
  HIGH: "Tinggi",
  MEDIUM: "Sedang",
  LOW: "Rendah",
};

export function NotificationItem({
  notification,
  onMarkRead,
}: NotificationItemProps) {
  const router = useRouter();

  const handleAction = () => {
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
  };

  const handleMarkRead = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onMarkRead(notification.id);
  };

  return (
    <div
      className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50 ${
        notification.isRead ? "bg-white" : "bg-green-50/40"
      }`}
    >
      <div className="mt-1 shrink-0">
        <div
          className={`h-2.5 w-2.5 rounded-full ${
            notification.isRead ? "bg-transparent" : "bg-green-500"
          }`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-900">
              {notification.title}
            </p>
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityStyles[notification.priority]}`}
            >
              {priorityLabel[notification.priority]}
            </span>
          </div>

          <span className="shrink-0 text-[11px] text-slate-400">
            {notification.timeAgo}
          </span>
        </div>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {notification.message}
        </p>

        <div className="mt-2 flex items-center gap-2">
          {notification.actionUrl && notification.actionLabel ? (
            <button
              type="button"
              onClick={handleAction}
              className="rounded-md bg-green-600 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-green-700"
            >
              {notification.actionLabel}
            </button>
          ) : null}
          {!notification.isRead ? (
            <button
              type="button"
              onClick={handleMarkRead}
              className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-100"
            >
              Tandai dibaca
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}