import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Store } from '../types/store';

interface StoreManagementState {
    stores: Store[];
    activeStoreId: string | null;
    addStore: (store: Omit<Store, 'id' | 'createdAt'>) => void;
    setActiveStore: (storeId: string) => void;
    getStoreById: (storeId: string) => Store | undefined;
}

export const useStoreManagementStore = create<StoreManagementState>()(
    persist(
        (set, get) => ({
            stores: [
                // Default store for single-store setups
                { id: 'main_branch', name: 'Main Branch', address: 'Dhaka, Bangladesh', createdAt: new Date().toISOString() },
                { id: 'ctg_branch', name: 'Chittagong Branch', address: 'Chittagong, Bangladesh', createdAt: new Date().toISOString() }
            ],
            activeStoreId: 'main_branch', // Default active store

            addStore: (store) => {
                const newStore: Store = {
                    ...store,
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({
                    stores: [...state.stores, newStore],
                }));
            },

            setActiveStore: (storeId) => {
                const storeExists = get().stores.some(s => s.id === storeId);
                if (storeExists) {
                    set({ activeStoreId: storeId });
                    console.log(`[Store] Active store changed to: ${storeId}`);
                } else {
                    console.warn(`[Store] Attempted to set non-existent store ID: ${storeId}`);
                }
            },

            getStoreById: (storeId) => {
                return get().stores.find(s => s.id === storeId);
            },
        }),
        {
            name: 'store-management-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);