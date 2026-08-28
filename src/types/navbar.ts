export type NotificationType =
  | "CRITICAL_STOCK"
  | "EXPIRED_WARNING"
  | "ACTION_RECOMMENDATION"
  | "SYSTEM_INFO";

export type NotificationPriority = "HIGH" | "MEDIUM" | "LOW";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  actionUrl: string | null;
  actionLabel: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  timeAgo: string;
}

export interface NotificationCenterData {
  notifications: Notification[];
  unreadCount: number;
  generatedCount: number;
}

export interface NotificationCenterResponse {
  success: boolean;
  message?: string;
  data?: NotificationCenterData;
}