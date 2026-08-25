export interface StockReceiptListItem {
  id: string;
  receiptNumber: string;
  invoiceNumber: string | null;
  receivedAt: Date | string;
  createdAt: Date | string;
  purchaseOrder: {
    id: string;
    poNumber: string;
  } | null;
  supplier: {
    id: string;
    code: string;
    name: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number | string;
    item: {
      id: string;
      code: string;
      name: string;
      unit: string;
    };
  }>;
}

export interface ReceivablePoOption {
  id: string;
  poNumber: string;
  status: "PENDING" | "PARTIAL" | "COMPLETED" | "CANCELLED";
  supplierName: string;
}
