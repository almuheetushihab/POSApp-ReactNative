import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // ১. Persist ইমপোর্ট
import AsyncStorage from '@react-native-async-storage/async-storage'; // ২. Storage ইমপোর্ট
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
                // 🔥 যদি অলরেডি স্টোরে প্রোডাক্ট থাকে (Persisted), তাহলে নতুন করে ফেচ করার দরকার নেই
                // এতে করে আপনার অ্যাড করা নতুন প্রোডাক্টগুলো হারিয়ে যাবে না।
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
                    result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
                }

                set({ filteredProducts: result });
            },

            searchProducts: (query) => {
                const { products, activeCategory } = get();
                set({ searchQuery: query });

                let result = products.filter((p) =>
                    p.name.toLowerCase().includes(query.toLowerCase())
                );

                if (activeCategory !== 'All') {
                    result = result.filter(p => p.category === activeCategory);
                }

                set({ filteredProducts: result });
            },

            addProduct: (newProduct) => {
                set((state) => {
                    const updatedList = [newProduct, ...state.products];
                    // নতুন প্রোডাক্ট অ্যাড করার পর ফিল্টার রিসেট করা হচ্ছে যাতে সেটি সামনে দেখা যায়
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
                    // মেইন প্রোডাক্ট লিস্ট আপডেট
                    const newProducts = state.products.map((product) => {
                        const cartItem = cartItems.find((item) => item.id === product.id);
                        if (cartItem) {
                            return { ...product, stock: product.stock - cartItem.quantity };
                        }
                        return product;
                    });

                    // ফিল্টারড লিস্টও আপডেট (যাতে UI তে রিফ্লেক্ট করে)
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
            name: 'product-storage', // স্টোরেজ কী (Key)
            storage: createJSONStorage(() => AsyncStorage), // AsyncStorage ব্যবহার
        }
    )
);