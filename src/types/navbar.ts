export type NotificationType =
  | "CRITICAL_STOCK"
  | "EXPIRED_WARNING"
  | "ACTION_RECOMMENDATION"
  | "SYSTEM_INFO"
  | "AUDIT_FREEZE";

export type NotificationPriority = "HIGH" | "MEDIUM" | "LOW";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  typeLabel: string;
  priority: NotificationPriority;
  priorityLabel: string;
  isRead: boolean;
  actionLink: string | null;
  actionLabel: string | null;
  createdAt: string;
  relativeTime: string;
}

export interface NotificationListResponse {
  success: boolean;
  message?: string;
  data: Notification[];
  unreadCount: number;
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  filters?: {
    type: NotificationType | null;
    isRead: boolean | null;
  };
}
