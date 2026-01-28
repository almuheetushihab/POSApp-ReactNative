import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order } from '../types/order';

interface OrderState {
    orders: Order[];
    addOrder: (order: Order) => void;
    getTodaySales: () => number;
    getTotalOrders: () => number;
}

export const useOrderStore = create<OrderState>()(
    persist(
        (set, get) => ({
            orders: [],

            addOrder: (order) => {
                set((state) => ({ orders: [order, ...state.orders] }));
            },

            getTodaySales: () => {
                const today = new Date().toDateString();
                return get().orders
                    .filter(o => new Date(o.date).toDateString() === today)
                    .reduce((sum, order) => sum + order.totalAmount, 0);
            },

            getTotalOrders: () => get().orders.length,
        }),
        {
            name: 'order-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);