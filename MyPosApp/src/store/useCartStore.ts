import { create } from 'zustand';
import { Product, ProductAttributes } from '../types/product';
import {CartItem} from "../types/carts";

interface CartState {
    cart: CartItem[];
    addToCart: (product: Product, attributes?: ProductAttributes) => void;
    removeFromCart: (productId: string, attributes?: ProductAttributes) => void;
    increaseQuantity: (productId: string, attributes?: ProductAttributes) => void;
    decreaseQuantity: (productId: string, attributes?: ProductAttributes) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getTotalItems: () => number;
}

const generateCartId = (productId: string, attributes?: ProductAttributes) => {
    if (!attributes || Object.keys(attributes).length === 0) {
        return productId;
    }
    // Create a stable, sorted key from attributes
    const attributeString = Object.keys(attributes)
        .sort()
        .map(key => `${key}:${attributes[key as keyof ProductAttributes]}`)
        .join('|');
    return `${productId}-${attributeString}`;
};

export const useCartStore = create<CartState>((set, get) => ({
    cart: [],

    addToCart: (product, attributes) => {
        const { cart } = get();
        const cartId = generateCartId(product.id, attributes);
        const existingItem = cart.find((item) => item.cartId === cartId);

        if (existingItem) {
            set({
                cart: cart.map((item) =>
                    item.cartId === cartId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ),
            });
        } else {
            set({ cart: [...cart, { ...product, quantity: 1, attributes, cartId }] });
        }
    },

    removeFromCart: (productId, attributes) => {
        const cartId = generateCartId(productId, attributes);
        set({ cart: get().cart.filter((item) => item.cartId !== cartId) });
    },

    increaseQuantity: (productId, attributes) => {
        const cartId = generateCartId(productId, attributes);
        set({
            cart: get().cart.map((item) =>
                item.cartId === cartId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ),
        });
    },

    decreaseQuantity: (productId, attributes) => {
        const { cart } = get();
        const cartId = generateCartId(productId, attributes);
        const item = cart.find((i) => i.cartId === cartId);

        if (item && item.quantity > 1) {
            set({
                cart: cart.map((i) =>
                    i.cartId === cartId ? { ...i, quantity: i.quantity - 1 } : i
                ),
            });
        } else {
            set({ cart: cart.filter((i) => i.cartId !== cartId) });
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
