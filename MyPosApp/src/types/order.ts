import {CartItem} from "./carts";

export type OrderStatus = 'COMPLETED' | 'REFUNDED' | 'RETURNED' | 'PARTIAL_RETURN' | 'EXCHANGED';

export type PaymentMethod = 'CASH' | 'CARD' | 'MFS' | 'SPLIT';

export type CardType = 'VISA' | 'MASTERCARD' | 'AMEX' | 'OTHER';
export type MFSType = 'BKASH' | 'NAGAD' | 'ROCKET' | 'UPAY' | 'OTHER';

export interface CardPaymentDetails {
    cardType?: CardType;
    lastFourDigits?: string;
    transactionId?: string;
}

export interface MFSPaymentDetails {
    mfsType?: MFSType;
    phoneNumber?: string;
    transactionId?: string;
}

export interface SplitPaymentDetails {
    cashAmount: number;
    cardAmount: number;
    cardDetails?: CardPaymentDetails;
    mfsAmount: number;
    mfsDetails?: MFSPaymentDetails;
}

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
    paymentMethod: PaymentMethod;
    cardDetails?: CardPaymentDetails; // Populated if paymentMethod is 'CARD'
    mfsDetails?: MFSPaymentDetails;   // Populated if paymentMethod is 'MFS'
    splitPaymentDetails?: SplitPaymentDetails; // Populated if paymentMethod is 'SPLIT'
    status: OrderStatus;
    refundDetails?: RefundDetails;
    exchangeDetails?: ExchangeDetails;
}