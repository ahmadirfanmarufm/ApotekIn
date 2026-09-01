export interface InventoryHealthData {
  score: number;
  totalSku: number;
  criticalCount: number;
  safeSku: number;
}

export interface FinancialDayData {
  date: string;
  revenue: number;
  expense: number;
}

export interface FinancialChartData {
  days: FinancialDayData[];
  totalRevenue: number;
  totalExpense: number;
}

export interface FastMovingVelocity {
  itemId: string;
  itemName: string;
  itemCode: string;
  totalQtySold24h: number;
}

export interface AiExecutiveSummaryPayload {
  snapshotAt: string;
  criticalItemCount: number;
  fastMoving: FastMovingVelocity[];
  fefoCompliancePct: number;
  promptHint: string;
}

export type PriorityTaskType =
  | "EXPIRY_TODAY"
  | "REORDER_CRITICAL"
  | "AUDIT_SCHEDULED";

export interface PriorityTaskItem {
  id: string;
  type: PriorityTaskType;
  title: string;
  description: string;
  dueAt: string | null;
  isCompleted: boolean;
  entityId: string;
}

export type StockAlertReason = "LOW_STOCK" | "NEAR_EXPIRY" | "BOTH";

export interface StockAlertItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  currentStock: number;
  minStock: number;
  nearestExpiry: string | null;
  daysUntilExpiry: number | null;
  reason: StockAlertReason;
}

export interface TopMovingItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  totalQty: number;
  relativePercent: number;
}

export type DeliveryStatus = "ON_TIME" | "DELAYED" | "PENDING";

export interface SupplierPerformanceItem {
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  totalDeliveries: number;
  onTimeCount: number;
  delayedCount: number;
  pendingCount: number;
  onTimePct: number;
  status: DeliveryStatus;
}

export type ActivitySource =
  | "STOCK_OUT"
  | "STOCK_RECEIPT"
  | "STOCK_AUDIT"
  | "PURCHASE_ORDER";

export interface RecentActivityItem {
  id: string;
  source: ActivitySource;
  title: string;
  description: string;
  actorName: string;
  createdAt: string;
  relativeTime: string;
}

export interface DashboardData {
  health: InventoryHealthData;
  financial: FinancialChartData;
  tasks: PriorityTaskItem[];
  alerts: StockAlertItem[];
  topMoving: TopMovingItem[];
  suppliers: SupplierPerformanceItem[];
  activities: RecentActivityItem[];
}

export type NarrativeSeverity = "GOOD" | "WARNING" | "CRITICAL";

export interface NarrativePayload {
  headline: string;
  insight: string;
  recommendation: string;
  severity: NarrativeSeverity;
}

export interface ExecutiveSummary {
  healthScore: number;
  totalSku: number;
  criticalCount: number;
  topCriticalItem: {
    itemId: string;
    itemName: string;
    daysUntilExpiry: number | null;
  } | null;
  fastMovingName: string | null;
  fastMovingQty: number;
  fefoCompliancePct: number;
  revenue30d: number;
  expense30d: number;
  marginPct: number;
  pendingTasksCount: number;
  onTimeSupplierPct: number;
  lastActivity: { title: string; actor: string; relativeTime: string } | null;
  narrative: NarrativePayload;
  generatedAt: string;
  cachedUntil: string;
}
