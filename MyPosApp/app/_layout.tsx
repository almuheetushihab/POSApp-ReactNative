import "../src/global.css";
import "../src/i18n";
import { Slot } from 'expo-router';
import { useEffect } from "react";
import { useColorScheme } from "nativewind";
import { useAppStore } from "../src/store/useAppStore";
import { useOrderStore } from "../src/store/useOrderStore";
import { useProductStore } from "../src/store/useProductStore";
import { useCustomerStore } from "../src/store/useCustomerStore";
import { useAuthStore } from "../src/store/useAuthStore";

export default function RootLayout() {
    const { theme } = useAppStore();
    const { setColorScheme } = useColorScheme();
    const { isAuthenticated } = useAuthStore();
    
    const fetchOrders = useOrderStore(state => state.fetchInitialOrders);
    const fetchProducts = useProductStore(state => state.fetchInitialProducts);
    const fetchCustomers = useCustomerStore(state => state.fetchInitialCustomers);

    useEffect(() => {
        setColorScheme(theme);
    }, [theme]);

    useEffect(() => {
        // Fetch data only when the user is authenticated
        if (isAuthenticated) {
            fetchOrders();
            fetchProducts();
            fetchCustomers();
        }
    }, [isAuthenticated]);

    return <Slot />;
}