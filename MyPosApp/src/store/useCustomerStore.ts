import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomerDetails } from '../types/order';

interface CustomerState {
    customers: CustomerDetails[];
    addCustomer: (customer: Omit<CustomerDetails, 'loyaltyPoints' | 'totalSpent'>) => CustomerDetails;
    updateCustomer: (id: string, updatedCustomer: Partial<CustomerDetails>) => void;
    deleteCustomer: (id: string) => void;
    searchCustomers: (query: string) => CustomerDetails[];
    addPointsToCustomer: (id: string, pointsToAdd: number, amountSpent: number) => void;
    deductPointsFromCustomer: (id: string, pointsToDeduct: number) => void;
}

export const useCustomerStore = create<CustomerState>()(
    persist(
        (set, get) => ({
            customers: [
                { id: '1', name: 'Walk-in Customer', phone: '00000000000', loyaltyPoints: 0, totalSpent: 0 },
            ],

            addCustomer: (customer) => {
                const newCustomer: CustomerDetails = {
                    ...customer,
                    id: customer.id || Date.now().toString(),
                    loyaltyPoints: 0,
                    totalSpent: 0,
                };
                set((state) => ({
                    customers: [...state.customers, newCustomer],
                }));
                return newCustomer;
            },

            updateCustomer: (id, updatedCustomer) => {
                set((state) => ({
                    customers: state.customers.map((c) =>
                        c.id === id ? { ...c, ...updatedCustomer } : c
                    ),
                }));
            },

            deleteCustomer: (id) => {
                set((state) => ({
                    customers: state.customers.filter((c) => c.id !== id),
                }));
            },

            searchCustomers: (query) => {
                const { customers } = get();
                const lowerQuery = query.toLowerCase();
                return customers.filter(
                    (c) =>
                        c.name.toLowerCase().includes(lowerQuery) ||
                        c.phone.includes(lowerQuery)
                );
            },

            addPointsToCustomer: (id, pointsToAdd, amountSpent) => {
                set((state) => ({
                    customers: state.customers.map((c) => {
                        if (c.id === id) {
                            return {
                                ...c,
                                loyaltyPoints: (c.loyaltyPoints || 0) + pointsToAdd,
                                totalSpent: (c.totalSpent || 0) + amountSpent,
                            };
                        }
                        return c;
                    }),
                }));
            },

            deductPointsFromCustomer: (id, pointsToDeduct) => {
                set((state) => ({
                    customers: state.customers.map((c) => {
                        if (c.id === id) {
                            return {
                                ...c,
                                loyaltyPoints: Math.max(0, (c.loyaltyPoints || 0) - pointsToDeduct),
                            };
                        }
                        return c;
                    }),
                }));
            },
        }),
        {
            name: 'customer-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);