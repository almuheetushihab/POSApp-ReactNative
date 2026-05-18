import { create } from 'zustand';
import { CustomerDetails } from '../types/order';
import { useSyncQueueStore } from './useSyncQueueStore';
import { useNetworkStore } from './useNetworkStore';

interface CustomerState {
    customers: CustomerDetails[];
    setCustomers: (customers: CustomerDetails[]) => void;
    addCustomer: (customer: CustomerDetails) => void;
    updateCustomer: (id: string, updatedCustomer: Partial<CustomerDetails>) => void;
    deleteCustomer: (id: string) => void;
    searchCustomers: (query: string) => CustomerDetails[];
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
    customers: [
        { id: '1', name: 'Walk-in Customer', phone: '' },
    ],

    setCustomers: (customers) => set({ customers }),

    addCustomer: (customer) => {
        const { isOnline } = useNetworkStore.getState();
        const { addToQueue } = useSyncQueueStore.getState();

        const newCustomer = {
            ...customer,
            id: customer.id || Date.now().toString(),
        };
        set((state) => ({
            customers: [...state.customers, newCustomer],
        }));

        if (!isOnline) {
            addToQueue('CREATE_CUSTOMER', newCustomer);
        }
    },

    updateCustomer: (id, updatedCustomer) => {
        set((state) => ({
            customers: state.customers.map((c) =>
                c.id === id ? { ...c, ...updatedCustomer } : c
            ),
        }));
        // Offline sync for update can be added here if needed
    },

    deleteCustomer: (id) => {
        set((state) => ({
            customers: state.customers.filter((c) => c.id !== id),
        }));
        // Offline sync for delete can be added here if needed
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
}));
