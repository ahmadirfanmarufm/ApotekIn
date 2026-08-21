import { Notification } from "@/types/navbar";

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  return (
    <button
      type="button"
      className="flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50"
    >
      <div className="mt-1 shrink-0">
        <div
          className={`h-2.5 w-2.5 rounded-full ${
            notification.unread ? "bg-green-500" : "bg-transparent"
          }`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-slate-900">
            {notification.title}
          </p>

          <span className="shrink-0 text-[11px] text-slate-400">
            {notification.time}
          </span>
        </div>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {notification.message}
        </p>
      </div>
    </button>
  );
}