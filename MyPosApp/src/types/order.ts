import {CartItem} from "./carts";

export interface Order {
    id: string;
    items: CartItem[];
    totalAmount: number;
    date: string;
    paymentMethod: 'CASH' | 'CARD' | 'MFS';
}