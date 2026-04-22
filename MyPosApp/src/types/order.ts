import {CartItem} from "./carts";

export type OrderStatus = 'COMPLETED' | 'REFUNDED' | 'RETURNED' | 'PARTIAL_RETURN' | 'EXCHANGED';

export interface RefundDetails {
    refundDate: string;
    refundedAmount: number;
    reason?: string;
    refundedItems?: { productId: string; quantity: number }[];
}

export interface ExchangeDetails {
    exchangeDate: string;
    reason?: string;
    exchangedItems: { oldProductId: string; newProductId: string; quantity: number }[];
    priceDifference: number; // positive means customer pays more, negative means shop owes customer
}

export interface Order {
    id: string;
    items: CartItem[];
    totalAmount: number;
    date: string;
    paymentMethod: 'CASH' | 'CARD' | 'MFS';
    status: OrderStatus;
    refundDetails?: RefundDetails;
    exchangeDetails?: ExchangeDetails;
}