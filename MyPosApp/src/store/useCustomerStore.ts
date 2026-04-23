import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomerDetails } from '../types/order';
import { cloudSyncService } from '../services/syncService';

interface CustomerState {
    customers: CustomerDetails[];
    unsyncedCustomers: string[]; // Keep track of customers that failed to sync
    
    // Actions
    addCustomer: (customer: Omit<CustomerDetails, 'loyaltyPoints' | 'totalSpent'>) => CustomerDetails;
    updateCustomer: (id: string, updatedCustomer: Partial<CustomerDetails>) => void;
    deleteCustomer: (id: string) => void;
    searchCustomers: (query: string) => CustomerDetails[];
    addPointsToCustomer: (id: string, pointsToAdd: number, amountSpent: number) => void;
    deductPointsFromCustomer: (id: string, pointsToDeduct: number) => void;
    
    // Cloud Sync
    retryFailedSyncs: () => void;
}

export const useCustomerStore = create<CustomerState>()(
    persist(
        (set, get) => ({
            customers: [
                { id: '1', name: 'Walk-in Customer', phone: '00000000000', loyaltyPoints: 0, totalSpent: 0 },
            ],
            unsyncedCustomers: [],

            addCustomer: (customer) => {
                const newCustomer: CustomerDetails = {
                    ...customer,
                    id: customer.id || Date.now().toString(),
                    loyaltyPoints: 0,
                    totalSpent: 0,
                };
                
                set((state) => ({
                    customers: [...state.customers, newCustomer],
                    unsyncedCustomers: [...state.unsyncedCustomers, newCustomer.id as string]
                }));
                
                // Attempt Background Sync
                cloudSyncService.syncCustomer(newCustomer).then(isSuccess => {
                    if (isSuccess && newCustomer.id) {
                        set((state) => ({
                            unsyncedCustomers: state.unsyncedCustomers.filter(id => id !== newCustomer.id)
                        }));
                    }
                });

                return newCustomer;
            },

            updateCustomer: (id, updatedCustomer) => {
                let currentCustomer: CustomerDetails | undefined;
                
                set((state) => {
                    const mapped = state.customers.map((c) => {
                        if (c.id === id) {
                            currentCustomer = { ...c, ...updatedCustomer };
                            return currentCustomer;
                        }
                        return c;
                    });
                    return { 
                        customers: mapped,
                        unsyncedCustomers: [...state.unsyncedCustomers, id]
                    };
                });
                
                if (currentCustomer) {
                    cloudSyncService.syncCustomer(currentCustomer).then(isSuccess => {
                        if (isSuccess) {
                            set((state) => ({
                                unsyncedCustomers: state.unsyncedCustomers.filter(cid => cid !== id)
                            }));
                        }
                    });
                }
            },

            deleteCustomer: (id) => {
                // To keep it simple, we just delete locally. 
                // For a real backend, you'd call a delete method on Firebase too.
                set((state) => ({
                    customers: state.customers.filter((c) => c.id !== id),
                    unsyncedCustomers: state.unsyncedCustomers.filter(cid => cid !== id) // Remove from queue if deleted
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
                let currentCustomer: CustomerDetails | undefined;
                
                set((state) => ({
                    customers: state.customers.map((c) => {
                        if (c.id === id) {
                            currentCustomer = {
                                ...c,
                                loyaltyPoints: (c.loyaltyPoints || 0) + pointsToAdd,
                                totalSpent: (c.totalSpent || 0) + amountSpent,
                            };
                            return currentCustomer;
                        }
                        return c;
                    }),
                    unsyncedCustomers: [...state.unsyncedCustomers, id]
                }));
                
                if (currentCustomer) {
                    cloudSyncService.syncCustomer(currentCustomer).then(isSuccess => {
                        if (isSuccess) {
                            set((state) => ({
                                unsyncedCustomers: state.unsyncedCustomers.filter(cid => cid !== id)
                            }));
                        }
                    });
                }
            },

            deductPointsFromCustomer: (id, pointsToDeduct) => {
                let currentCustomer: CustomerDetails | undefined;
                
                set((state) => ({
                    customers: state.customers.map((c) => {
                        if (c.id === id) {
                            currentCustomer = {
                                ...c,
                                loyaltyPoints: Math.max(0, (c.loyaltyPoints || 0) - pointsToDeduct),
                            };
                            return currentCustomer;
                        }
                        return c;
                    }),
                    unsyncedCustomers: [...state.unsyncedCustomers, id]
                }));
                
                if (currentCustomer) {
                    cloudSyncService.syncCustomer(currentCustomer).then(isSuccess => {
                        if (isSuccess) {
                            set((state) => ({
                                unsyncedCustomers: state.unsyncedCustomers.filter(cid => cid !== id)
                            }));
                        }
                    });
                }
            },
            
            retryFailedSyncs: async () => {
                const { unsyncedCustomers, customers } = get();
                if (unsyncedCustomers.length === 0) return;
                
                console.log(`[SYNC] Retrying ${unsyncedCustomers.length} failed customers...`);
                
                for (const customerId of [...unsyncedCustomers]) {
                    const customerToSync = customers.find(c => c.id === customerId);
                    if (customerToSync) {
                        const isSuccess = await cloudSyncService.syncCustomer(customerToSync);
                        if (isSuccess) {
                            set((state) => ({
                                unsyncedCustomers: state.unsyncedCustomers.filter(id => id !== customerId)
                            }));
                        }
                    }
                }
            },
        }),
        {
            name: 'customer-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);