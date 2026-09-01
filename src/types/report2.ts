export type ReportPeriod =
  | "3d"
  | "10d"
  | "20d"
  | "1m"
  | "3m"
  | "6m"
  | "1y"
  | "all";

export interface ReportMetric {
  value: number;
  previousValue: number;
  percentageChange: number;
}

export interface InventoryTrend {
  label: string;
  stockIn: number;
  stockOut: number;
  revenue: number;
}

export interface SupplierPerformance {
  id: string;
  name: string;
  totalOrders: number;
  completedOrders: number;
  fulfillmentRate: number;
  averageLeadTime: number;
}

export interface ProductEfficiency {
  category: string;
  stockIn: number;
  stockOut: number;
  turnoverRate: number;
  efficiency: number;
  /** Perubahan persentase turnoverRate dibanding periode sebelumnya (bisa negatif). */
  trendChange: number;
}

export interface TopProduct {
  itemId: string;
  name: string;
  code: string;
  category: string;
  quantitySold: number;
  revenue: number;
}

export interface ExpiringBatch {
  itemId: string;
  itemName: string;
  itemCode: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  daysUntilExpiry: number;
}

export interface FinancialSummary {
  revenue: ReportMetric;
  cogs: ReportMetric;
  grossProfit: ReportMetric;
  marginPercent: number;
  previousMarginPercent: number;
}

export interface ReportsData {
  period: {
    key: ReportPeriod;
    label: string;
    startDate: string | null;
    endDate: string;
  };

  metrics: {
    totalRevenue: ReportMetric;
    totalStockIn: ReportMetric;
    inventoryTurnover: ReportMetric;
    /** Unit obat yang dicatat sebagai write-off (StockOut reason=EXPIRED) dalam periode ini. */
    expiredWriteOffs: ReportMetric;
    /** Jumlah item yang SAAT INI memiliki batch kedaluwarsa (kondisi live, bukan dibatasi periode). */
    expiredItemsNow: number;
    lowStockItems: number;
  };

  financial: FinancialSummary;

  trends: InventoryTrend[];

  suppliers: SupplierPerformance[];

  efficiency: ProductEfficiency[];

  topProducts: TopProduct[];

  expiringSoon: ExpiringBatch[];

  summary: {
    healthScore: number;
    message: string;
  };
}
