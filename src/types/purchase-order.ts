export type POStatusUI =
  | "PENDING"
  | "PARTIAL"
  | "COMPLETED"
  | "CANCELLED";

export interface PurchaseOrderSupplier {
  id: string;
  code: string;
  name: string;
}

export interface PurchaseOrderItemSummary {
  id: string;
  quantity: number;
  receivedQty: number;
}

export interface PurchaseOrderListItem {
  id: string;
  poNumber: string;
  status: POStatusUI;
  totalAmount: number | string;
  createdAt: Date | string;
  receivedAt: Date | string | null;
  supplier: PurchaseOrderSupplier;
  items: PurchaseOrderItemSummary[];
}

export interface PurchaseOrderDetailItem {
  id: string;
  itemId: string;

  orderedQty: number;
  receivedQty: number;
  remainingQty: number;

  unitPrice: number | string;

  suggestedBatchNumber: string | null;
  suggestedExpiryDate: Date | string | null;

  item: {
    id: string;
    code: string;
    name: string;
    unit: string;
  };
}

export interface PurchaseOrderDetail {
  id: string;
  poNumber: string;
  status: POStatusUI;
  totalAmount: number | string;
  notes: string | null;
  createdAt: Date | string;
  receivedAt: Date | string | null;

  supplier: PurchaseOrderSupplier;

  createdBy?: {
    id: string;
    fullName: string;
  };

  items: PurchaseOrderDetailItem[];
}