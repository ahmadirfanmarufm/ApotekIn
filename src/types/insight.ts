export type InsightSeverity = "low" | "medium" | "high";
export type StockAction = "restock" | "reduce" | "monitor";

export interface InsightRisk {
  title: string;
  detail: string;
  severity: InsightSeverity;
}

export interface InsightOpportunity {
  title: string;
  detail: string;
}

export interface StockRecommendation {
  itemName: string;
  action: StockAction;
  reason: string;
  suggestedQuantity: number | null;
}

export interface InsightResult {
  headline: string;
  healthAssessment: string;
  forecast: string;
  risks: InsightRisk[];
  opportunities: InsightOpportunity[];
  stockRecommendations: StockRecommendation[];
  supplierNote: string | null;
}

export interface InsightResponse {
  id: string;
  title: string;
  result: InsightResult;
  generatedAt: string;
  cached: boolean;
  /** Ringkasan angka mentah yang dipakai AI, ditampilkan untuk transparansi. */
  digestSnapshot: {
    lowStockCount: number;
    expiringSoonCount: number;
    revenueLast7Days: number;
    revenuePrev7Days: number;
    topSellingItem: string | null;
    worstSupplier: string | null;
  };
}
