import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Supplier } from '../types/supplier';

// Mock data for initial development
const initialSuppliers: Supplier[] = [
    {
        id: 'sup_1',
        name: 'Global Electronics Ltd.',
        contactPerson: 'Mr. Alam',
        phone: '01711000001',
        email: 'alam@global-electronics.com',
        address: '123 Motijheel, Dhaka',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'sup_2',
        name: 'Fresh Produce BD',
        phone: '01811000002',
        address: 'Kawran Bazar, Dhaka',
        createdAt: new Date().toISOString(),
    },
];

interface SupplierState {
    suppliers: Supplier[];
    isLoading: boolean;
    setSuppliers: (suppliers: Supplier[]) => void; // New action for restoring
    fetchSuppliers: () => Promise<void>;
    addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
    updateSupplier: (updatedSupplier: Supplier) => void;
    deleteSupplier: (supplierId: string) => void;
    getSupplierById: (supplierId: string) => Supplier | undefined;
}

export const useSupplierStore = create<SupplierState>()(
    persist(
        (set, get) => ({
            suppliers: [],
            isLoading: false,

            setSuppliers: (suppliers) => set({ suppliers }),

            fetchSuppliers: async () => {
                // In a real app, you would fetch this from a service/API
                // For now, we use mock data if the store is empty.
                if (get().suppliers.length === 0) {
                    set({ suppliers: initialSuppliers, isLoading: false });
                }
            },

            addSupplier: (newSupplierData) => {
                const newSupplier: Supplier = {
                    ...newSupplierData,
                    id: `sup_${Date.now()}`,
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({
                    suppliers: [newSupplier, ...state.suppliers],
                }));
            },

            updateSupplier: (updatedSupplier) => {
                set((state) => ({
                    suppliers: state.suppliers.map((s) =>
                        s.id === updatedSupplier.id ? updatedSupplier : s
                    ),
                }));
            },

            deleteSupplier: (supplierId) => {
                set((state) => ({
                    suppliers: state.suppliers.filter((s) => s.id !== supplierId),
                }));
            },

            getSupplierById: (supplierId) => {
                return get().suppliers.find(s => s.id === supplierId);
            },
        }),
        {
            name: 'supplier-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
