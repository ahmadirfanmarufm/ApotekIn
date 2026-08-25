export type StockOutReasonUI =
  | "SALE"
  | "EXPIRED"
  | "DAMAGED"
  | "REFUND"
  | "RETURN_TO_SUPPLIER"
  | "OTHER";

export const STOCK_OUT_REASON_LABEL: Record<StockOutReasonUI, string> = {
  SALE: "Penjualan",
  EXPIRED: "Kedaluwarsa",
  DAMAGED: "Rusak",
  REFUND: "Refund",
  RETURN_TO_SUPPLIER: "Retur ke Supplier",
  OTHER: "Lainnya",
};

export interface StockOutBatchOption {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  sellPrice: string;
  itemId: string;
  item: {
    id: string;
    code: string;
    name: string;
    unit: string;
    category: string;
  };
}

export interface StockOutListItem {
  id: string;
  referenceNo: string;
  reason: StockOutReasonUI;
  totalAmount: number | string;
  notes: string | null;
  createdAt: Date | string;
  createdBy: {
    id: string;
    fullName: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number | string;
    batch: {
      id: string;
      batchNumber: string;
      expiryDate: Date | string;
      item: {
        id: string;
        code: string;
        name: string;
        unit: string;
      };
    };
  }>;
}
