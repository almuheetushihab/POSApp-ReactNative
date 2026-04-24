import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Customer } from '../types/customer';
import { cloudSyncService } from '../services/syncService';

interface CustomerState {
    customers: Customer[];
    isLoaded: boolean;
    fetchInitialCustomers: (force?: boolean) => Promise<void>;
    addCustomer: (customer: Customer) => Promise<void>;
    updateCustomer: (customer: Customer) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>()(
    persist(
        (set, get) => ({
            customers: [],
            isLoaded: false,

            fetchInitialCustomers: async (force = false) => {
                if (get().isLoaded && !force) return;
                const cloudCustomers = await cloudSyncService.fetchCustomers();
                set({ customers: cloudCustomers, isLoaded: true });
            },

            addCustomer: async (customer) => {
                // Avoid adding duplicates
                if (get().customers.some(c => c.id === customer.id || (c.phone && c.phone === customer.phone))) {
                    return;
                }
                set((state) => ({
                    customers: [...state.customers, customer],
                }));
                await cloudSyncService.syncCustomer(customer);
            },

            updateCustomer: async (customer) => {
                set((state) => ({
                    customers: state.customers.map((c) => (c.id === customer.id ? customer : c)),
                }));
                await cloudSyncService.syncCustomer(customer);
            },
        }),
        {
            name: 'customer-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ customers: state.customers }),
        }
    )
);