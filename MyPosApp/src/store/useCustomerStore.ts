import { create } from 'zustand';
import { CustomerDetails } from '../types/order';

interface CustomerState {
    customers: CustomerDetails[];
    setCustomers: (customers: CustomerDetails[]) => void; // New action for restoring
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
        const newCustomer = {
            ...customer,
            id: customer.id || Date.now().toString(),
        };
        set((state) => ({
            customers: [...state.customers, newCustomer],
        }));
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
}));