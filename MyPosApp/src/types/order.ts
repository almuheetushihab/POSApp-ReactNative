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
    paymentMethod?: PaymentMethod;
    splitPaymentDetails?: SplitPaymentDetails;
    cardDetails?: CardPaymentDetails;
    mfsDetails?: MFSPaymentDetails;
}

export interface DiscountDetails {
    type: 'FIXED' | 'PERCENTAGE';
    value: number; // e.g. 50 (fixed 50 Taka) or 10 (10% off)
    amountCalculated: number; // The actual Taka amount deducted
    reason?: string; // Optional reason for the discount
}

export interface TaxDetails {
    taxName: string; // e.g. VAT, GST
    taxRate: number; // e.g. 5%
    taxAmount: number; // Calculated tax amount in Taka
    isInclusive: boolean; // Whether the tax was already included in the item price or added on top
}

export interface CustomerDetails {
    id?: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    addresse?: string;

}

export interface Order {
    id: string;
    items: CartItem[];
    subTotal: number; // Sum of items price * quantity before discount
    discount?: DiscountDetails; // Information about any applied discount
    tax?: TaxDetails; // Information about applied tax/VAT
    totalAmount: number; // Final amount to pay (subTotal - discount + tax (if exclusive))
    date: string;
    
    // Customer Info
    customer?: CustomerDetails;

    // Payment Info
    paymentMethod: PaymentMethod;
    cardDetails?: CardPaymentDetails; // Populated if paymentMethod is 'CARD'
    mfsDetails?: MFSPaymentDetails;   // Populated if paymentMethod is 'MFS'
    splitPaymentDetails?: SplitPaymentDetails; // Populated if paymentMethod is 'SPLIT'
    
    status: OrderStatus;
    refundDetails?: RefundDetails;
    exchangeDetails?: ExchangeDetails;
}