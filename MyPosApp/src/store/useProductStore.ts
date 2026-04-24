import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types/product';
import { cloudSyncService } from '../services/syncService';

interface ProductState {
    products: Product[];
    isLoaded: boolean;
    fetchInitialProducts: (force?: boolean) => Promise<void>;
    addProduct: (product: Product) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    deleteProduct: (productId: string) => Promise<void>;
}

export const useProductStore = create<ProductState>()(
    persist(
        (set, get) => ({
            products: [],
            isLoaded: false,

            fetchInitialProducts: async (force = false) => {
                if (get().isLoaded && !force) return;
                const cloudProducts = await cloudSyncService.fetchProducts();
                set({ products: cloudProducts, isLoaded: true });
            },

            addProduct: async (product) => {
                set((state) => ({
                    products: [...state.products, product],
                }));
                await cloudSyncService.syncProduct(product);
            },

            updateProduct: async (product) => {
                set((state) => ({
                    products: state.products.map((p) => (p.id === product.id ? product : p)),
                }));
                await cloudSyncService.syncProduct(product);
            },

            deleteProduct: async (productId) => {
                set((state) => ({
                    products: state.products.filter((p) => p.id !== productId),
                }));
                // Note: Deleting from Firestore is a destructive action.
                // We might want to "soft delete" by setting a flag instead.
                // For now, we assume a hard delete is fine.
                // await cloudSyncService.deleteProduct(productId);
            },
        }),
        {
            name: 'product-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ products: state.products }),
        }
    )
);