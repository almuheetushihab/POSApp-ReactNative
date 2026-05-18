import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types/product';
import { productService } from '../services/productService';
import { useSyncQueueStore } from './useSyncQueueStore';
import { useNetworkStore } from './useNetworkStore';
import { useAuditLogStore } from './useAuditLogStore';

interface ProductState {
    // States
    products: Product[];
    isLoading: boolean;
    searchQuery: string;

    // Actions
    setProducts: (products: Product[]) => void;
    fetchProducts: () => Promise<void>;
    searchProducts: (query: string) => void;
    addProduct: (product: Product) => void;
    updateProduct: (updatedProduct: Product) => void;
    deleteProduct: (productId: string) => void;
    reduceStock: (cartItems: any[]) => void;
    restoreStock: (items: {id: string, quantity: number}[]) => void;
}

export const useProductStore = create<ProductState>()(
    persist(
        (set, get) => ({
            products: [],
            isLoading: false,
            searchQuery: '',

            setProducts: (products) => set({
                products,
                searchQuery: '',
            }),

            fetchProducts: async () => {
                if (get().products.length > 0) {
                    return;
                }

                set({ isLoading: true });
                try {
                    const response = await productService.getAllProducts();
                    if (response.success) {
                        set({
                            products: response.data,
                            isLoading: false
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch products', error);
                    set({ isLoading: false });
                }
            },

            searchProducts: (query) => {
                set({ searchQuery: query });
            },

            addProduct: (newProduct) => {
                const { isOnline } = useNetworkStore.getState();
                const { addToQueue } = useSyncQueueStore.getState();
                const { addLog } = useAuditLogStore.getState();

                set((state) => ({
                    products: [newProduct, ...state.products],
                    searchQuery: ''
                }));

                addLog('CREATE_PRODUCT', `Created product: ${newProduct.name}`, newProduct.id);

                if (!isOnline) {
                    addToQueue('CREATE_PRODUCT', newProduct);
                }
            },

            updateProduct: (updatedProduct) => {
                const { isOnline } = useNetworkStore.getState();
                const { addToQueue } = useSyncQueueStore.getState();
                const { addLog } = useAuditLogStore.getState();
                const oldProduct = get().products.find(p => p.id === updatedProduct.id);

                set((state) => {
                    const newProducts = state.products.map((p) =>
                        p.id === updatedProduct.id ? updatedProduct : p
                    );
                    return { products: newProducts };
                });

                addLog('UPDATE_PRODUCT', `Updated product: ${updatedProduct.name}`, updatedProduct.id);

                if (!isOnline) {
                    addToQueue('UPDATE_PRODUCT', updatedProduct);
                }
            },

            deleteProduct: (productId) => {
                const { addLog } = useAuditLogStore.getState();
                const productToDelete = get().products.find(p => p.id === productId);

                set((state) => ({
                    products: state.products.filter((p) => p.id !== productId)
                }));
                
                if (productToDelete) {
                    addLog('DELETE_PRODUCT', `Deleted product: ${productToDelete.name}`, productId);
                }
            },

            reduceStock: (cartItems) => {
                set((state) => {
                    const newProducts = state.products.map((product) => {
                        const cartItem = cartItems.find((item) => item.id === product.id);
                        if (cartItem) {
                            return { ...product, stock: product.stock - cartItem.quantity };
                        }
                        return product;
                    });
                    return { products: newProducts };
                });
            },

            restoreStock: (items) => {
                set((state) => {
                    const newProducts = state.products.map((product) => {
                        const returnedItem = items.find((item) => item.id === product.id);
                        if (returnedItem) {
                            return { ...product, stock: product.stock + returnedItem.quantity };
                        }
                        return product;
                    });
                    return { products: newProducts };
                });
            },
        }),
        {
            name: 'product-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
