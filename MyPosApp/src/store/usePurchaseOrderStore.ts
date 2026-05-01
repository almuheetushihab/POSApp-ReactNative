import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PurchaseOrder, PurchaseOrderStatus } from '../types/purchaseOrder';
import { useProductStore } from './useProductStore';

interface PurchaseOrderState {
    purchaseOrders: PurchaseOrder[];
    fetchPurchaseOrders: () => Promise<void>;
    addPurchaseOrder: (orderData: Omit<PurchaseOrder, 'id' | 'totalAmount' | 'orderDate' | 'status'>) => PurchaseOrder;
    updatePurchaseOrderStatus: (orderId: string, status: PurchaseOrderStatus) => void;
    getPurchaseOrderById: (orderId: string) => PurchaseOrder | undefined;
}

export const usePurchaseOrderStore = create<PurchaseOrderState>()(
    persist(
        (set, get) => ({
            purchaseOrders: [],

            fetchPurchaseOrders: async () => {
                // For now, we just ensure the state is loaded from storage.
                // In a real app, this might fetch from a remote server.
            },

            addPurchaseOrder: (orderData) => {
                const totalAmount = orderData.items.reduce(
                    (sum, item) => sum + item.quantity * item.purchasePrice,
                    0
                );

                const newOrder: PurchaseOrder = {
                    ...orderData,
                    id: `po_${Date.now()}`,
                    totalAmount,
                    orderDate: new Date().toISOString(),
                    status: 'PENDING',
                };

                set((state) => ({
                    purchaseOrders: [newOrder, ...state.purchaseOrders],
                }));
                
                return newOrder;
            },

            updatePurchaseOrderStatus: (orderId, status) => {
                set((state) => ({
                    purchaseOrders: state.purchaseOrders.map((order) => {
                        if (order.id === orderId && order.status !== 'COMPLETED') {
                            // If the new status is 'COMPLETED', update product stock
                            if (status === 'COMPLETED') {
                                const { products, updateProduct } = useProductStore.getState();
                                
                                order.items.forEach(item => {
                                    const product = products.find(p => p.id === item.productId);
                                    if (product) {
                                        updateProduct({
                                            ...product,
                                            stock: product.stock + item.quantity,
                                            // Optionally update the purchase price on the product
                                            purchasePrice: item.purchasePrice,
                                        });
                                    }
                                });

                                return { ...order, status, completedDate: new Date().toISOString() };
                            }
                            return { ...order, status };
                        }
                        return order;
                    }),
                }));
            },

            getPurchaseOrderById: (orderId) => {
                return get().purchaseOrders.find(po => po.id === orderId);
            },
        }),
        {
            name: 'purchase-order-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
