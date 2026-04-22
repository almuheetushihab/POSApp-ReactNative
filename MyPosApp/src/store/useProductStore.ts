import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types/product';
import { productService } from '../services/productService';

interface ProductState {
    // States
    products: Product[];
    filteredProducts: Product[];
    isLoading: boolean;
    activeCategory: string;
    searchQuery: string;

    // Actions
    fetchProducts: () => Promise<void>;
    filterByCategory: (category: string) => void;
    searchProducts: (query: string) => void;
    addProduct: (product: Product) => void;
    updateProduct: (updatedProduct: Product) => void;
    deleteProduct: (productId: string) => void;
    reduceStock: (cartItems: any[]) => void;
}

export const useProductStore = create<ProductState>()(
    persist(
        (set, get) => ({
            products: [],
            filteredProducts: [],
            isLoading: false,
            activeCategory: 'All',
            searchQuery: '',

            fetchProducts: async () => {
                if (get().products.length > 0) {
                    set({ filteredProducts: get().products });
                    return;
                }

                set({ isLoading: true });
                try {
                    const response = await productService.getAllProducts();
                    if (response.success) {
                        set({
                            products: response.data,
                            filteredProducts: response.data,
                            isLoading: false
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch products', error);
                    set({ isLoading: false });
                }
            },

            filterByCategory: (category) => {
                const { products, searchQuery } = get();
                set({ activeCategory: category });

                let result = category === 'All'
                    ? products
                    : products.filter((p) => p.category === category);

                if (searchQuery) {
                    const lowerQuery = searchQuery.toLowerCase();
                    result = result.filter(p => 
                        p.name.toLowerCase().includes(lowerQuery) ||
                        (p.sku && p.sku.toLowerCase().includes(lowerQuery)) ||
                        (p.barcode && p.barcode.toLowerCase().includes(lowerQuery))
                    );
                }

                set({ filteredProducts: result });
            },

            searchProducts: (query) => {
                const { products, activeCategory } = get();
                set({ searchQuery: query });

                const lowerQuery = query.toLowerCase();
                
                // Smart search: Check name, SKU, or barcode
                let result = products.filter((p) =>
                    p.name.toLowerCase().includes(lowerQuery) ||
                    (p.sku && p.sku.toLowerCase().includes(lowerQuery)) ||
                    (p.barcode && p.barcode.toLowerCase().includes(lowerQuery))
                );

                if (activeCategory !== 'All') {
                    result = result.filter(p => p.category === activeCategory);
                }

                set({ filteredProducts: result });
            },

            addProduct: (newProduct) => {
                set((state) => {
                    const updatedList = [newProduct, ...state.products];
                    return {
                        products: updatedList,
                        filteredProducts: updatedList,
                        activeCategory: 'All',
                        searchQuery: ''
                    };
                });
            },

            updateProduct: (updatedProduct) => {
                set((state) => {
                    const newProducts = state.products.map((p) =>
                        p.id === updatedProduct.id ? updatedProduct : p
                    );

                    const newFiltered = state.filteredProducts.map((p) =>
                        p.id === updatedProduct.id ? updatedProduct : p
                    );

                    return { products: newProducts, filteredProducts: newFiltered };
                });
            },

            deleteProduct: (productId) => {
                set((state) => {
                    const newProducts = state.products.filter((p) => p.id !== productId);
                    const newFiltered = state.filteredProducts.filter((p) => p.id !== productId);
                    return { products: newProducts, filteredProducts: newFiltered };
                });
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

                    const newFiltered = state.filteredProducts.map((product) => {
                        const cartItem = cartItems.find((item) => item.id === product.id);
                        if (cartItem) {
                            return { ...product, stock: product.stock - cartItem.quantity };
                        }
                        return product;
                    });

                    return {
                        products: newProducts,
                        filteredProducts: newFiltered
                    };
                });
            },
        }),
        {
            name: 'product-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);