import { create } from 'zustand';
import { Product } from '../types/product';
import {CartItem} from "../types/carts";

interface CartState {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    increaseQuantity: (productId: string) => void;
    decreaseQuantity: (productId: string) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    cart: [],

    addToCart: (product) => {
        const { cart } = get();
        const existingItem = cart.find((item) => item.id === product.id);

        if (existingItem) {
            set({
                cart: cart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ),
            });
        } else {
            set({ cart: [...cart, { ...product, quantity: 1 }] });
        }
    },

    removeFromCart: (productId) => {
        set({ cart: get().cart.filter((item) => item.id !== productId) });
    },

    increaseQuantity: (productId) => {
        set({
            cart: get().cart.map((item) =>
                item.id === productId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ),
        });
    },

    decreaseQuantity: (productId) => {
        const { cart } = get();
        const item = cart.find((i) => i.id === productId);

        if (item && item.quantity > 1) {
            set({
                cart: cart.map((i) =>
                    i.id === productId ? { ...i, quantity: i.quantity - 1 } : i
                ),
            });
        } else {
            set({ cart: cart.filter((i) => i.id !== productId) });
        }
    },

    clearCart: () => set({ cart: [] }),

    getTotalPrice: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
    },

    getTotalItems: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0);
    }
}));