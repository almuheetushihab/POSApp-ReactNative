import "../src/global.css";
import "../src/i18n";
import { Stack } from 'expo-router';
import { useEffect } from "react";
import { useColorScheme } from "nativewind";
import { useAppStore } from "../src/store/useAppStore";
import NetInfo from "@react-native-community/netinfo";
import { useNetworkStore } from "../src/store/useNetworkStore";

export default function RootLayout() {
    const { theme } = useAppStore();
    const { setColorScheme } = useColorScheme();
    const { setIsOnline } = useNetworkStore();

    useEffect(() => {
        setColorScheme(theme);
    }, [theme]);

    // Subscribe to network state changes
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const isOnline = state.isConnected != null && state.isConnected && state.isInternetReachable != null && state.isInternetReachable;
            setIsOnline(isOnline);
        });

        return () => {
            unsubscribe(); // Cleanup on unmount
        };
    }, []);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="dashboard" />
            <Stack.Screen
                name="productdetails"
                options={{ presentation: 'modal', headerShown: false }}
            />
        </Stack>
    );
}
