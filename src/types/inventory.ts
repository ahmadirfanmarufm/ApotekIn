export interface OtcPurchaseOrder {
    id: string;
    poNumber: string;
    supplierId: string;
    branchId: string;
    createdById: string;
    status: string;
    totalAmount: number | string;
    receivedAt: Date | string | null;
    notes: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;

    supplier: {
        id: string;
        code: string;
        name: string;
        contactPerson: string | null;
        email: string | null;
        phone: string;
        address: string | null;
        leadTimeDays: number;
        healthScore: number;
        aiSummary: string | null;
        isActive: boolean;
        createdAt: Date | string;
        updatedAt: Date | string;
    };
}

export interface OtcPurchaseOrderItem {
    id: string;
    purchaseOrderId: string;
    itemId: string;
    batchNumber: string;
    quantity: number;
    expiryDate: Date | string;
    unitPrice: number | string;
    createdAt: Date | string;

    purchaseOrder: OtcPurchaseOrder;
}

export interface OtcInventoryItem {
    id: string;
    name: string;
    code: string;
    unit: string;
    minStock: number;
    maxStock: number;
    imageUrl: string | null;
    description: string | null;

    batches: OtcBatch[];
}

export interface OtcBatch {
    id: string;
    batchNumber: string;
    quantity: number;
    initialQuantity: number;
    expiryDate: string;
    buyPrice: string;
    sellPrice: string;
}

export interface OtcFormData {
    name: string;
    code: string;
    unit: string;
    minStock: string;
    maxStock: string;
    description: string;
    imageUrl: string;

    batchNumber: string;
    quantity: string;
    expiryDate: string;
    buyPrice: string;
    sellPrice: string;
}

export interface CompoundInventoryItem {
    id: string;
    name: string;
    code: string;
    unit: string;
    minStock: number;
    maxStock: number;
    description: string | null;

    batches: CompoundBatch[];
}

export interface CompoundBatch {
    id: string;
    batchNumber: string;
    quantity: number;
    initialQuantity: number;
    expiryDate: string;
    buyPrice: string;
    sellPrice: string;
}

export interface CompoundFormData {
    name: string;
    code: string;
    unit: string;
    minStock: string;
    maxStock: string;
    description: string;

    batchNumber: string;
    quantity: string;
    expiryDate: string;
    buyPrice: string;
    sellPrice: string;
}

export interface NonMedicineInventoryItem {
    id: string;
    name: string;
    code: string;
    unit: string;
    minStock: number;
    maxStock: number;
    imageUrl: string | null;
    description: string | null;

    batches: OtcBatch[];
}

export interface NonMedicineBatch {
    id: string;
    batchNumber: string;
    quantity: number;
    initialQuantity: number;
    expiryDate: string;
    buyPrice: string;
    sellPrice: string;
}

export interface NonMedicineFormData {
    name: string;
    code: string;
    unit: string;
    minStock: string;
    maxStock: string;
    description: string;
    imageUrl: string;

    batchNumber: string;
    quantity: string;
    expiryDate: string;
    buyPrice: string;
    sellPrice: string;
}