import {CartItem} from "./carts";

export type OrderStatus = 'COMPLETED' | 'REFUNDED' | 'RETURNED' | 'PARTIAL_RETURN';

export interface RefundDetails {
    refundDate: string;
    refundedAmount: number;
    reason?: string;
    refundedItems?: { productId: string; quantity: number }[];
}

export interface Order {
    id: string;
    items: CartItem[];
    totalAmount: number;
    date: string;
    paymentMethod: 'CASH' | 'CARD' | 'MFS';
    status: OrderStatus;
    refundDetails?: RefundDetails;
}