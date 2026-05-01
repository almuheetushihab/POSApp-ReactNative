import { Supplier } from './supplier';

export interface PurchaseOrderItem {
    productId: string;
    productName: string; // Denormalized for easier display
    quantity: number;
    purchasePrice: number; // The price at the time of purchase
}

export type PurchaseOrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface PurchaseOrder {
    id: string;
    supplierId: string;
    supplier?: Supplier; // Denormalized for easier display
    items: PurchaseOrderItem[];
    totalAmount: number;
    status: PurchaseOrderStatus;
    orderDate: string; // ISO 8601 format
    completedDate?: string; // ISO 8601 format
    notes?: string;
}
