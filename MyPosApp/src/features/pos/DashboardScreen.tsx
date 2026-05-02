import React, {useCallback, useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect, useRouter} from "expo-router";
import {useTranslation} from "react-i18next";
import {Ionicons} from "@expo/vector-icons";
import {useOrderStore} from "../../store/useOrderStore";
import {useProductStore} from "../../store/useProductStore";
import {SalesChart} from "../../components/SalesChart";
import {useAuthStore} from "../../store/useAuthStore";

export const DashboardScreen = () => {
    const router = useRouter();
    const {t} = useTranslation();

    const {orders, getTodaySales, getTotalOrders} = useOrderStore();
    const {products, fetchProducts} = useProductStore();
    const { user, hasPermission, logout } = useAuthStore();

    const [refreshing, setRefreshing] = useState(false);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchProducts();
        setRefreshing(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
        }, [])
    );

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Logout", 
                    style: "destructive", 
                    onPress: () => {
                        logout();
                        router.replace('/');
                    }
                }
            ]
        );
    };

    // RBAC logic to hide/show UI parts
    const canViewAnalytics = hasPermission(['Admin', 'Manager']);
    const canViewProducts = hasPermission(['Admin', 'Manager']);
    const canManageCustomers = hasPermission(['Admin', 'Manager']);
    const canViewSettings = hasPermission(['Admin']);

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            <ScrollView
                contentContainerStyle={{padding: 20}}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Header Profile Section */}
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center gap-3">
                        <View className="h-12 w-12 bg-blue-100 dark:bg-slate-800 rounded-full items-center justify-center border border-blue-200 dark:border-slate-700">
                            <Text className="font-bold text-blue-700 dark:text-blue-400 text-lg">
                                {user?.name?.charAt(0) || 'U'}
                            </Text>
                        </View>
                        <View>
                            <Text className="text-2xl font-bold text-slate-800 dark:text-white">
                                {getGreeting()},
                            </Text>
                            <View className="flex-row items-center mt-1">
                                <Text className="text-slate-500 dark:text-slate-400 font-medium">
                                    {user?.name || 'User'}
                                </Text>
                                <View className={`ml-2 px-2 py-0.5 rounded-md ${
                                    user?.role === 'Admin' ? 'bg-rose-100' :
                                    user?.role === 'Manager' ? 'bg-purple-100' : 'bg-green-100'
                                }`}>
                                    <Text className={`text-[10px] font-bold ${
                                        user?.role === 'Admin' ? 'text-rose-700' :
                                        user?.role === 'Manager' ? 'text-purple-700' : 'text-green-700'
                                    }`}>{user?.role || 'Guest'}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    
                    <TouchableOpacity onPress={handleLogout} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full">
                        <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                    </TouchableOpacity>
                </View>

                {/* Dashboard Analytics (Hidden for Cashiers) */}
                {canViewAnalytics ? (
                    <>
                        <View className="flex-row flex-wrap justify-between mb-6">
                            <View className="bg-blue-600 w-[48%] p-4 rounded-2xl mb-4 shadow-sm">
                                <View className="bg-blue-500/30 h-8 w-8 rounded-full items-center justify-center mb-2">
                                    <Ionicons name="cash-outline" size={18} color="white"/>
                                </View>
                                <Text className="text-blue-100 text-xs font-medium uppercase tracking-wider">{t('total_sales')} (Today)</Text>
                                <Text className="text-white text-2xl font-bold mt-1">৳ {getTodaySales()}</Text>
                            </View>

                            <View className="bg-orange-500 w-[48%] p-4 rounded-2xl mb-4 shadow-sm">
                                <View className="bg-orange-400/30 h-8 w-8 rounded-full items-center justify-center mb-2">
                                    <Ionicons name="receipt-outline" size={18} color="white"/>
                                </View>
                                <Text className="text-orange-100 text-xs font-medium uppercase tracking-wider">{t('total_orders')}</Text>
                                <Text className="text-white text-2xl font-bold mt-1">{getTotalOrders()}</Text>
                            </View>

                            <View className="bg-emerald-500 w-[48%] p-4 rounded-2xl mb-4 shadow-sm">
                                <View className="bg-emerald-400/30 h-8 w-8 rounded-full items-center justify-center mb-2">
                                    <Ionicons name="cube-outline" size={18} color="white"/>
                                </View>
                                <Text className="text-emerald-100 text-xs font-medium uppercase tracking-wider">{t('products')}</Text>
                                <Text className="text-white text-2xl font-bold mt-1">{products.length}</Text>
                            </View>

                            <View className="bg-rose-500 w-[48%] p-4 rounded-2xl mb-4 shadow-sm">
                                <View className="bg-rose-400/30 h-8 w-8 rounded-full items-center justify-center mb-2">
                                    <Ionicons name="time-outline" size={18} color="white"/>
                                </View>
                                <Text className="text-rose-100 text-xs font-medium uppercase tracking-wider">Last Sale</Text>
                                <Text className="text-white text-2xl font-bold mt-1">
                                    ৳ {orders.length > 0 ? orders[0].totalAmount : 0}
                                </Text>
                            </View>
                        </View>
                        <SalesChart/>
                    </>
                ) : (
                    <View className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 mb-6 flex-row items-center gap-4">
                        <View className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-sm">
                            <Ionicons name="lock-closed" size={24} color="#3b82f6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-blue-800 dark:text-blue-300 font-bold text-base">Analytics Hidden</Text>
                            <Text className="text-blue-600 dark:text-blue-400 text-xs mt-1">Sales and product reports are restricted to Admin & Manager roles.</Text>
                        </View>
                    </View>
                )}

                {/* Quick Actions */}
                <Text className="text-xl font-bold text-slate-800 dark:text-white mb-4 mt-2">
                    {t('quick_actions') || 'Quick Actions'}
                </Text>

                <View className="flex-row flex-wrap justify-between">
                    <QuickActionButton
                        icon="cart" label="new_sale"
                        color="#2563eb" onPress={() => router.push('/(tabs)/pos')}
                    />
                    
                    <QuickActionButton
                        icon="document-text" label="history"
                        color="#10b981" onPress={() => router.push('/history')}
                    />

                    {/* Restricted Actions */}
                    {canViewProducts ? (
                        <QuickActionButton
                            icon="cube" label="products"
                            color="#f59e0b" onPress={() => router.push('/(tabs)/products')}
                        />
                    ) : (
                        <QuickActionButton
                            icon="cube" label="Products"
                            color="#94a3b8" onPress={() => Alert.alert("Access Denied", "You don't have permission to manage products.")}
                            disabled
                        />
                    )}

                    {canManageCustomers ? (
                        <QuickActionButton
                            icon="people" label="Customers"
                            color="#8b5cf6" onPress={() => router.push('/features/customer')}
                        />
                    ) : (
                         <QuickActionButton
                            icon="people" label="Customers"
                            color="#94a3b8" onPress={() => Alert.alert("Access Denied", "You don't have permission to manage customers.")}
                            disabled
                        />
                    )}

                    {canViewSettings ? (
                        <QuickActionButton
                            icon="settings" label="settings"
                            color="#64748b" onPress={() => router.push('/(tabs)/settings')}
                        />
                    ) : (
                        <QuickActionButton
                            icon="settings" label="Settings"
                            color="#94a3b8" onPress={() => Alert.alert("Access Denied", "Only Admins can access settings.")}
                            disabled
                        />
                    )}
                </View>

                {/* Recent Orders Preview */}
                {orders.length > 0 && (
                    <View className="mt-4">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-lg font-bold text-slate-800 dark:text-white">Recent Transactions</Text>
                            <TouchableOpacity onPress={() => router.push('/history')}>
                                <Text className="text-blue-600 font-bold text-sm">See All</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Show only top 3 recent orders */}
                        {orders.slice(0, 3).map((order) => (
                            <View key={order.id} className="flex-row justify-between items-center bg-white dark:bg-slate-900 p-4 mb-2 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                                <View className="flex-row items-center gap-3">
                                    <View className={`p-2 rounded-lg ${
                                        order.status === 'COMPLETED' ? 'bg-green-50 dark:bg-green-900/20' : 
                                        order.status === 'REFUNDED' ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-indigo-50 dark:bg-indigo-900/20'
                                    }`}>
                                        <Ionicons 
                                            name={order.status === 'COMPLETED' ? 'checkmark-circle' : order.status === 'REFUNDED' ? 'return-down-back' : 'swap-horizontal'} 
                                            size={20} 
                                            color={order.status === 'COMPLETED' ? '#16a34a' : order.status === 'REFUNDED' ? '#e11d48' : '#4f46e5'}
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-slate-800 dark:text-white font-bold">#{order.id.slice(-6).toUpperCase()}</Text>
                                        <Text className="text-slate-400 text-xs">{new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                                    </View>
                                </View>
                                <Text className={`font-bold text-lg ${order.status === 'COMPLETED' ? 'text-slate-800 dark:text-white' : 'text-slate-400 line-through'}`}>
                                    ৳ {order.totalAmount}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const QuickActionButton = ({icon, label, onPress, color, disabled = false}: any) => {
    const {t} = useTranslation();
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={disabled ? 1 : 0.7}
            className={`bg-white dark:bg-slate-900 w-[48%] p-6 rounded-2xl mb-4 items-center justify-center border border-gray-100 dark:border-slate-800 ${disabled ? 'opacity-50 bg-gray-50' : 'shadow-sm'}`}
        >
            {disabled && (
                <View className="absolute top-2 right-2 bg-gray-200 dark:bg-slate-700 p-1 rounded-full">
                    <Ionicons name="lock-closed" size={12} color="#64748b" />
                </View>
            )}
            <Ionicons name={icon} size={32} color={color} style={{marginBottom: 8}}/>
            <Text className="font-semibold text-slate-700 dark:text-slate-200 text-center">
                {t(label) || label}
            </Text>
        </TouchableOpacity>
    );
};