"use client";

import { useRouter } from "next/navigation";
import type { Notification } from "@/types/navbar";

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onNavigate?: () => void;
}

const priorityStyles: Record<Notification["priority"], string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-slate-100 text-slate-600",
};

const typeIconStyles: Record<Notification["type"], string> = {
  CRITICAL_STOCK: "bg-red-50 text-red-600",
  EXPIRED_WARNING: "bg-amber-50 text-amber-600",
  ACTION_RECOMMENDATION: "bg-emerald-50 text-emerald-600",
  SYSTEM_INFO: "bg-sky-50 text-sky-600",
  AUDIT_FREEZE: "bg-violet-50 text-violet-600",
};

function NotificationIcon({ type }: { type: Notification["type"] }) {
  const cls = `flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${typeIconStyles[type]}`;
  if (type === "CRITICAL_STOCK") {
    return (
      <div className={cls}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
    );
  }
  if (type === "EXPIRED_WARNING") {
    return (
      <div className={cls}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
    );
  }
  if (type === "AUDIT_FREEZE") {
    return (
      <div className={cls}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
    );
  }
  if (type === "ACTION_RECOMMENDATION") {
    return (
      <div className={cls}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      </div>
    );
  }
  return (
    <div className={cls}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    </div>
  );
}

export function NotificationItem({
  notification,
  onMarkRead,
  onNavigate,
}: NotificationItemProps) {
  const router = useRouter();

  const handleAction = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
    if (notification.actionLink) {
      router.push(notification.actionLink);
      onNavigate?.();
    }
  };

  const handleRowClick = () => {
    if (!notification.isRead) onMarkRead(notification.id);
  };

  return (
    <div
      onClick={handleRowClick}
      className={`flex w-full cursor-pointer gap-3 border-b border-slate-100 px-4 py-3 transition-colors ${
        notification.isRead ? "bg-white" : "bg-emerald-50/40"
      } hover:bg-slate-50`}
    >
      <NotificationIcon type={notification.type} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p
            className={`text-sm ${notification.isRead ? "font-medium text-slate-700" : "font-semibold text-slate-900"}`}
          >
            {notification.title}
          </p>
          <span className="shrink-0 text-[11px] text-slate-400">
            {notification.relativeTime}
          </span>
        </div>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {notification.message}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityStyles[notification.priority]}`}
          >
            {notification.priorityLabel}
          </span>

          {notification.actionLink && notification.actionLabel && (
            <button
              type="button"
              onClick={handleAction}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              {notification.actionLabel}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
