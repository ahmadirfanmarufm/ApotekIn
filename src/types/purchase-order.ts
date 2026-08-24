export type POStatusUI = "PENDING" | "PARTIAL" | "COMPLETED" | "CANCELLED";

export interface PurchaseOrderSupplier {
  id: string;
  code: string;
  name: string;
}

export interface PurchaseOrderListItem {
  id: string;
  poNumber: string;
  status: POStatusUI;
  totalAmount: number | string;
  createdAt: Date | string;
  receivedAt: Date | string | null;
  supplier: PurchaseOrderSupplier;
  items: Array<{
    id: string;
    quantity: number;
    receivedQty: number;
  }>;
}

export interface PurchaseOrderDetailItem {
  id: string;
  itemId: string;
  suggestedBatchNumber: string | null;
  orderedQty: number;
  receivedQty: number;
  remainingQty: number;
  suggestedExpiryDate: Date | string | null;
  unitPrice: number | string;
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
