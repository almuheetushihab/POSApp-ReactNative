import {Product, ProductResponse} from "../types/product";
const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Burger King Large',
        price: 350,
        category: 'Food',
        stock: 15,
        image: 'https://img.icons8.com/color/96/hamburger.png'
    },
    {
        id: '2',
        name: 'Coca Cola 500ml',
        price: 60,
        category: 'Drinks',
        stock: 100,
        image: 'https://img.icons8.com/color/96/cola.png'
    },
    {
        id: '3',
        name: 'Chicken Pizza',
        price: 850,
        category: 'Food',
        stock: 5,
        image: 'https://img.icons8.com/color/96/pizza.png'
    },
    {
        id: '4',
        name: 'Mineral Water',
        price: 20,
        category: 'Drinks',
        stock: 50,
        image: 'https://img.icons8.com/color/96/bottle-of-water.png'
    },
    {
        id: '5',
        name: 'French Fries',
        price: 120,
        category: 'Snacks',
        stock: 20,
        image: 'https://img.icons8.com/color/96/french-fries.png'
    },
    {
        id: '6',
        name: 'Coffee Latte',
        price: 180,
        category: 'Drinks',
        stock: 12,
        image: 'https://img.icons8.com/color/96/cafe.png'
    },
];

// ---------------------------------------------------------
// SERVICE FUNCTIONS
// ---------------------------------------------------------
export const productService = {

    getAllProducts: async (): Promise<ProductResponse> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: MOCK_PRODUCTS,
                });
            }, 1000);
        });

        // ⚡ REAL API INTEGRATION (ভবিষ্যতে এটি ব্যবহার করবেন):
        /*
        try {
          const response = await fetch('https://api.yourdomain.com/products');
          const data = await response.json();
          return data;
        } catch (error) {
          return { success: false, data: [] };
        }
        */
    },

    getProductsByCategory: async (category: string): Promise<ProductResponse> => {
        // Mock Filtering
        const filtered = category === 'All'
            ? MOCK_PRODUCTS
            : MOCK_PRODUCTS.filter(p => p.category === category);

        return {success: true, data: filtered};
    }
};