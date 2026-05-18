import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, OrderStatus, RefundDetails, ExchangeDetails, ReturnDetails } from '../types/order';
import { useSyncQueueStore } from './useSyncQueueStore';
import { useNetworkStore } from './useNetworkStore';
import { useAuditLogStore } from './useAuditLogStore';

interface OrderState {
    orders: Order[];
    
    // Actions
    setOrders: (orders: Order[]) => void;
    addOrder: (order: Order) => void;
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

            setOrders: (orders) => set({ orders }),

            addOrder: (order) => {
                const { isOnline } = useNetworkStore.getState();
                const { addToQueue } = useSyncQueueStore.getState();

                const newOrder: Order = {
                    ...order,
                    status: order.status || 'COMPLETED',
                };

                set((state) => ({ orders: [newOrder, ...state.orders] }));

                if (!isOnline) {
                    addToQueue('CREATE_ORDER', newOrder);
                    console.log('[useOrderStore] Offline: Order added to sync queue.');
                } else {
                    console.log('[useOrderStore] Online: Order processed (simulation).');
                }
            },

            processRefund: (orderId, refundDetails, isPartial = false) => {
                const { addLog } = useAuditLogStore.getState();
                set((state) => {
                    const updatedOrders = state.orders.map((order) => {
                        if (order.id === orderId) {
                            addLog('PROCESS_REFUND', `Processed refund for order ${orderId}`, orderId);
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
                const { addLog } = useAuditLogStore.getState();
                 set((state) => {
                    const updatedOrders = state.orders.map((order) => {
                        if (order.id === orderId) {
                            addLog('PROCESS_RETURN', `Processed return for order ${orderId}`, orderId);
                            const returnDetails: ReturnDetails = {
                                returnDate: new Date().toISOString(),
                                reason: returnReason,
                            };
                            return {
                                ...order,
                                status: 'RETURNED' as OrderStatus,
                                returnDetails: returnDetails,
                            };
                        }
                        return order;
                    });
                    
                    return { orders: updatedOrders };
                });
            },

            processExchange: (orderId, exchangeDetails) => {
                const { addLog } = useAuditLogStore.getState();
                set((state) => {
                    const updatedOrders = state.orders.map((order) => {
                        if (order.id === orderId) {
                            addLog('PROCESS_EXCHANGE', `Processed exchange for order ${orderId}`, orderId);
                            const newTotal = order.totalAmount + exchangeDetails.priceDifference;
                            
                            return {
                                ...order,
                                status: 'EXCHANGED' as OrderStatus,
                                totalAmount: newTotal,
                                exchangeDetails: {
                                    ...exchangeDetails,
                                    exchangeDate: new Date().toISOString(),
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
