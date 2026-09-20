// @ts-ignore
import "../src/global.css";
import "../src/i18n";
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from "react";
import { LogBox } from "react-native";
import { useColorScheme } from "nativewind";
import { useAppStore } from "../src/store/useAppStore";
import NetInfo from "@react-native-community/netinfo";
import { useNetworkStore } from "../src/store/useNetworkStore";
import { SyncService } from "../src/services/SyncService";
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

function RouteGuard() {
    const router = useRouter();
    const segments = useSegments();
    const { isAuthenticated, isLoading, activeRole } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';
        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (isAuthenticated && !activeRole && segments.join('/') !== '(auth)/pin') {
            router.replace('/(auth)/pin');
        } else if (isAuthenticated && activeRole && inAuthGroup) {
            router.replace('/(tabs)/home');
        }
    }, [activeRole, isAuthenticated, isLoading, router, segments]);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
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

export default function RootLayout() {
    LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

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
        <StripeProvider publishableKey="pk_test_51TfPhkPhMna5WFviWDyoj44zk6BReZB1C7nOKxu0sUX1oQvT7hyIW203qdtIWClsXgLT5z6gq3vehaLhAsdrvAEe00cEyOtvu5">
            <AuthProvider>
                <RouteGuard />
            </AuthProvider>
        </StripeProvider>
    );
}
