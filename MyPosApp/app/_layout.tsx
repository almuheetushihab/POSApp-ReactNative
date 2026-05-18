import "../src/global.css";
import "../src/i18n";
import { Stack } from 'expo-router';
import { useEffect } from "react";
import { useColorScheme } from "nativewind";
import { useAppStore } from "../src/store/useAppStore";
import NetInfo from "@react-native-community/netinfo";
import { useNetworkStore } from "../src/store/useNetworkStore";
import { SyncService } from "../src/services/SyncService";

export default function RootLayout() {
    const { theme } = useAppStore();
    const { setColorScheme } = useColorScheme();
    const { setIsOnline } = useNetworkStore();

    useEffect(() => {
        setColorScheme(theme);
    }, [theme]);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const isOnline = state.isConnected != null && state.isConnected && state.isInternetReachable != null && state.isInternetReachable;
            setIsOnline(isOnline);
        });

        // Initialize the Sync Service
        SyncService.init();

        return () => {
            unsubscribe();
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
