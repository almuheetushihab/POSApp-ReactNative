import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, OrderStatus, RefundDetails } from '../types/order';

interface OrderState {
    orders: Order[];
    
    // Actions
    addOrder: (order: Order) => void;
    processRefund: (orderId: string, refundDetails: RefundDetails, isPartial?: boolean) => void;
    processReturn: (orderId: string, returnReason?: string) => void;
    clearOrders: () => void;
    
    // Getters
    getTodaySales: () => number;
    getTotalOrders: () => number;
    getRefundedAmount: () => number;
}

export const useOrderStore = create<OrderState>()(
    persist(
        (set, get) => ({
            orders: [],

            addOrder: (order) => {
                const newOrder: Order = {
                    ...order,
                    status: order.status || 'COMPLETED',
                };
                set((state) => ({ orders: [newOrder, ...state.orders] }));
            },

            processRefund: (orderId, refundDetails, isPartial = false) => {
                set((state) => {
                    const updatedOrders = state.orders.map((order) => {
                        if (order.id === orderId) {
                            return {
                                ...order,
                                status: (isPartial ? 'PARTIAL_RETURN' : 'REFUNDED') as OrderStatus,
                                refundDetails: {
                                    ...refundDetails,
                                    refundDate: new Date().toISOString(),
                                },
                            };
                        }
                        return order;
                    });
                    
                    return { orders: updatedOrders };
                });
            },

            processReturn: (orderId, returnReason = 'Customer returned items') => {
                 set((state) => {
                    const updatedOrders = state.orders.map((order) => {
                        if (order.id === orderId) {
                            return {
                                ...order,
                                status: 'RETURNED' as OrderStatus,
                                refundDetails: {
                                    refundDate: new Date().toISOString(),
                                    refundedAmount: order.totalAmount, // Assuming full return
                                    reason: returnReason,
                                },
                            };
                        }
                        return order;
                    });
                    
                    return { orders: updatedOrders };
                });
            },

            getTodaySales: () => {
                const today = new Date().toDateString();
                return get().orders
                    .filter((o) => {
                        const isToday = new Date(o.date).toDateString() === today;
                        // Exclude fully refunded/returned orders from today's active sales if needed
                        // For accounting, you might just want COMPLETED sales, or handle partials
                        return isToday && o.status === 'COMPLETED'; 
                    })
                    .reduce((sum, order) => sum + order.totalAmount, 0);
            },
            
            getRefundedAmount: () => {
                const today = new Date().toDateString();
                return get().orders
                    .filter(o => new Date(o.date).toDateString() === today && o.refundDetails)
                    .reduce((sum, order) => sum + (order.refundDetails?.refundedAmount || 0), 0);
            },

            getTotalOrders: () => get().orders.length,

            clearOrders: () => set({ orders: [] }),
        }),
        {
            name: 'order-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);