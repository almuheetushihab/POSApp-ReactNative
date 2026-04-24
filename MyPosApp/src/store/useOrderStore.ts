import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, OrderStatus, RefundDetails, ExchangeDetails } from '../types/order';
import { cloudSyncService } from '../services/syncService';

interface OrderState {
    orders: Order[];
    isLoaded: boolean; // To check if initial data is loaded
    
    // Actions
    fetchInitialOrders: (force?: boolean) => Promise<void>;
    addOrder: (order: Order) => Promise<void>;
    processRefund: (orderId: string, refundDetails: RefundDetails, isPartial?: boolean) => void;
    processReturn: (orderId: string, returnReason?: string) => void;
    processExchange: (orderId: string, exchangeDetails: ExchangeDetails) => void;
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
            isLoaded: false,

            fetchInitialOrders: async (force = false) => {
                if (get().isLoaded && !force) return; // Prevent re-fetching unless forced
                const cloudOrders = await cloudSyncService.fetchOrders();
                set({ orders: cloudOrders, isLoaded: true });
            },

            addOrder: async (order) => {
                const newOrder: Order = {
                    ...order,
                    status: order.status || 'COMPLETED',
                };
                
                // Optimistically update the local UI first
                set((state) => ({ 
                    orders: [newOrder, ...state.orders],
                }));
                
                // Attempt to upload to Firebase in the background
                const isSuccess = await cloudSyncService.syncOrder(newOrder);
                if (!isSuccess) {
                    // Handle failed sync if necessary (e.g., show a warning)
                    console.warn(`Order ${newOrder.id} failed to sync.`);
                }
            },

            processRefund: async (orderId, refundDetails, isPartial = false) => {
                let updatedOrder: Order | undefined;
                
                set((state) => {
                    const updatedOrders = state.orders.map((order) => {
                        if (order.id === orderId) {
                            updatedOrder = {
                                ...order,
                                status: (isPartial ? 'PARTIAL_RETURN' : 'REFUNDED') as OrderStatus,
                                refundDetails: {
                                    ...refundDetails,
                                    refundDate: new Date().toISOString(),
                                },
                            };
                            return updatedOrder;
                        }
                        return order;
                    });
                    
                    return { orders: updatedOrders };
                });

                if (updatedOrder) {
                    await cloudSyncService.syncOrder(updatedOrder);
                }
            },

            processReturn: async (orderId, returnReason = 'Customer returned items') => {
                 let updatedOrder: Order | undefined;
                 
                 set((state) => {
                    const updatedOrders = state.orders.map((order) => {
                        if (order.id === orderId) {
                            updatedOrder = {
                                ...order,
                                status: 'RETURNED' as OrderStatus,
                                refundDetails: {
                                    refundDate: new Date().toISOString(),
                                    refundedAmount: order.totalAmount, // Assuming full return
                                    reason: returnReason,
                                },
                            };
                            return updatedOrder;
                        }
                        return order;
                    });
                    
                    return { orders: updatedOrders };
                });
                
                if (updatedOrder) {
                    await cloudSyncService.syncOrder(updatedOrder);
                }
            },

            processExchange: async (orderId, exchangeDetails) => {
                let updatedOrder: Order | undefined;
                
                set((state) => {
                    const updatedOrders = state.orders.map((order) => {
                        if (order.id === orderId) {
                            const newTotal = order.totalAmount + exchangeDetails.priceDifference;
                            
                            updatedOrder = {
                                ...order,
                                status: 'EXCHANGED' as OrderStatus,
                                totalAmount: newTotal,
                                exchangeDetails: {
                                    ...exchangeDetails,
                                    exchangeDate: new Date().toISOString(),
                                },
                            };
                            return updatedOrder;
                        }
                        return order;
                    });
                    
                    return { orders: updatedOrders };
                });
                
                if (updatedOrder) {
                    await cloudSyncService.syncOrder(updatedOrder);
                }
            },

            getTodaySales: () => {
                const today = new Date().toDateString();
                return get().orders
                    .filter((o) => {
                        const isToday = new Date(o.date).toDateString() === today;
                        return isToday && (o.status === 'COMPLETED' || o.status === 'EXCHANGED');
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
            partialize: (state) => ({ orders: state.orders }),
        }
    )
);