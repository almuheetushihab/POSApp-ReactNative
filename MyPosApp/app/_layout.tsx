import "../src/global.css";
import "../src/i18n";
import { Stack } from 'expo-router';
import { useEffect } from "react";
import { useColorScheme } from "nativewind";
import { useAppStore } from "../src/store/useAppStore";
import { useOrderStore } from "../src/store/useOrderStore";
import { useProductStore } from "../src/store/useProductStore";
import { useCustomerStore } from "../src/store/useCustomerStore";
import { useAuthStore } from "../src/store/useAuthStore";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
        if (isAuthenticated) {
            fetchOrders();
            fetchProducts();
            fetchCustomers();
        }
    }, [isAuthenticated]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="login" />
                <Stack.Screen name="signup" />
                <Stack.Screen name="forgotpassword" />
                <Stack.Screen name="user-management" />
                <Stack.Screen name="account-requests" />
                <Stack.Screen name="history" />
                <Stack.Screen
                    name="productdetails"
                    options={{ presentation: 'modal' }}
                />
                <Stack.Screen
                    name="customerdetails"
                    options={{ presentation: 'modal' }}
                />
            </Stack>
        </GestureHandlerRootView>
    );
}