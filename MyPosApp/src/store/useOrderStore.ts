import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, OrderStatus, RefundDetails, ExchangeDetails } from '../types/order';
import { cloudSyncService } from '../services/syncService';

interface OrderState {
    orders: Order[];
    unsyncedOrders: string[]; // Keep track of order IDs that failed to upload
    
    // Actions
    addOrder: (order: Order) => void;
    processRefund: (orderId: string, refundDetails: RefundDetails, isPartial?: boolean) => void;
    processReturn: (orderId: string, returnReason?: string) => void;
    processExchange: (orderId: string, exchangeDetails: ExchangeDetails) => void;
    clearOrders: () => void;
    
    // Cloud Sync
    retryFailedSyncs: () => void;
    pullCloudUpdates: () => void; // Called when multi-device sync happens
    
    // Getters
    getTodaySales: () => number;
    getTotalOrders: () => number;
    getRefundedAmount: () => number;
}

export const useOrderStore = create<OrderState>()(
    persist(
        (set, get) => ({
            orders: [],
            unsyncedOrders: [],

            addOrder: async (order) => {
                const newOrder: Order = {
                    ...order,
                    status: order.status || 'COMPLETED',
                };
                
                // Optimistically update the local UI first
                set((state) => ({ 
                    orders: [newOrder, ...state.orders],
                    unsyncedOrders: [...state.unsyncedOrders, newOrder.id] // Mark as unsynced initially
                }));
                
                // Attempt to upload to Firebase/Supabase in the background
                const isSuccess = await cloudSyncService.syncOrder(newOrder);
                
                if (isSuccess) {
                    // Remove from unsynced list if upload succeeded
                    set((state) => ({
                        unsyncedOrders: state.unsyncedOrders.filter(id => id !== newOrder.id)
                    }));
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
                    
                    return { 
                        orders: updatedOrders,
                        unsyncedOrders: [...state.unsyncedOrders, orderId] // Mark as unsynced for the update
                    };
                });

                if (updatedOrder) {
                    const isSuccess = await cloudSyncService.syncOrder(updatedOrder);
                    if (isSuccess) {
                        set((state) => ({
                            unsyncedOrders: state.unsyncedOrders.filter(id => id !== orderId)
                        }));
                    }
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
                    
                    return { 
                        orders: updatedOrders,
                        unsyncedOrders: [...state.unsyncedOrders, orderId]
                    };
                });
                
                if (updatedOrder) {
                    const isSuccess = await cloudSyncService.syncOrder(updatedOrder);
                    if (isSuccess) {
                        set((state) => ({
                            unsyncedOrders: state.unsyncedOrders.filter(id => id !== orderId)
                        }));
                    }
                }
            },

            processExchange: async (orderId, exchangeDetails) => {
                let updatedOrder: Order | undefined;
                
                set((state) => {
                    const updatedOrders = state.orders.map((order) => {
                        if (order.id === orderId) {
                            // Calculate the new total amount based on the price difference
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
                    
                    return { 
                        orders: updatedOrders,
                        unsyncedOrders: [...state.unsyncedOrders, orderId]
                    };
                });
                
                if (updatedOrder) {
                    const isSuccess = await cloudSyncService.syncOrder(updatedOrder);
                    if (isSuccess) {
                        set((state) => ({
                            unsyncedOrders: state.unsyncedOrders.filter(id => id !== orderId)
                        }));
                    }
                }
            },

            retryFailedSyncs: async () => {
                const { unsyncedOrders, orders } = get();
                if (unsyncedOrders.length === 0) return;
                
                console.log(`[SYNC] Retrying ${unsyncedOrders.length} failed orders...`);
                
                for (const orderId of [...unsyncedOrders]) {
                    const orderToSync = orders.find(o => o.id === orderId);
                    if (orderToSync) {
                        const isSuccess = await cloudSyncService.syncOrder(orderToSync);
                        if (isSuccess) {
                            set((state) => ({
                                unsyncedOrders: state.unsyncedOrders.filter(id => id !== orderId)
                            }));
                        }
                    }
                }
            },

            pullCloudUpdates: async () => {
                 // Used when an admin clicks a 'Sync Now' button or app starts up
                 const data = await cloudSyncService.fetchCloudData();
                 if (data.orders && data.orders.length > 0) {
                     // Normally you would merge local and cloud intelligently.
                     // For example, resolving conflicts or picking the latest timestamp.
                     console.log('[SYNC] Pulled orders from cloud:', data.orders.length);
                 }
            },

            getTodaySales: () => {
                const today = new Date().toDateString();
                return get().orders
                    .filter((o) => {
                        const isToday = new Date(o.date).toDateString() === today;
                        // Exclude fully refunded/returned orders from today's active sales if needed
                        // Allow COMPLETED and EXCHANGED (since exchanged updates total)
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
        }
    )
);