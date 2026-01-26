import {create} from 'zustand';
import {Product} from '../types/product';
import {productService} from '../services/productService';

interface ProductState {
    products: Product[];
    filteredProducts: Product[];
    isLoading: boolean;
    activeCategory: string;
    searchQuery: string;

    // Actions
    fetchProducts: () => Promise<void>;
    filterByCategory: (category: string) => void;
    searchProducts: (query: string) => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    filteredProducts: [],
    isLoading: false,
    activeCategory: 'All',
    searchQuery: '',

    fetchProducts: async () => {
        set({isLoading: true});
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
            set({isLoading: false});
        }
    },

    filterByCategory: (category) => {
        const {products, searchQuery} = get();
        set({activeCategory: category});

        let result = category === 'All'
            ? products
            : products.filter((p) => p.category === category);

        if (searchQuery) {
            result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        set({filteredProducts: result});
    },

    searchProducts: (query) => {
        const {products, activeCategory} = get();
        set({searchQuery: query});

        let result = products.filter((p) =>
            p.name.toLowerCase().includes(query.toLowerCase())
        );

        if (activeCategory !== 'All') {
            result = result.filter(p => p.category === activeCategory);
        }

        set({filteredProducts: result});
    }
}));