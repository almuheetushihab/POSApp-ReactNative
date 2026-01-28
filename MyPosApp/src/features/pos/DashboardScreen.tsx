import React, {useCallback, useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect, useRouter} from "expo-router";
import {t} from "i18next";
import {useTranslation} from "react-i18next";
import {Ionicons} from "@expo/vector-icons";
import {useOrderStore} from "../../store/useOrderStore";
import {useProductStore} from "../../store/useProductStore";

export const DashboardScreen = () => {
    const router = useRouter();
    const {t} = useTranslation();

    const {orders, getTodaySales, getTotalOrders} = useOrderStore();
    const {products, fetchProducts} = useProductStore();

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

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            <ScrollView
                contentContainerStyle={{padding: 20}}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
                }
            >

                {/* Header Section */}
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-2xl font-bold text-slate-800 dark:text-white">
                            {getGreeting()} 👋
                        </Text>
                        <Text className="text-slate-500 dark:text-slate-400">
                            {t('overview')}
                        </Text>
                    </View>
                    <View
                        className="h-10 w-10 bg-gray-200 dark:bg-slate-800 rounded-full items-center justify-center border border-gray-300 dark:border-slate-700">
                        <Text className="font-bold text-slate-700 dark:text-white">A</Text>
                    </View>
                </View>

                {/* Stats Cards (REAL DATA) */}
                <View className="flex-row flex-wrap justify-between mb-6">

                    {/* 1. Total Sales Today */}
                    <View className="bg-blue-600 w-[48%] p-4 rounded-2xl mb-4 shadow-sm">
                        <View className="bg-blue-500/30 h-8 w-8 rounded-full items-center justify-center mb-2">
                            <Ionicons name="cash-outline" size={18} color="white"/>
                        </View>
                        <Text
                            className="text-blue-100 text-xs font-medium uppercase tracking-wider">{t('total_sales')} (Today)</Text>
                        <Text className="text-white text-2xl font-bold mt-1">৳ {getTodaySales()}</Text>
                    </View>

                    {/* 2. Total Orders (All Time) */}
                    <View className="bg-orange-500 w-[48%] p-4 rounded-2xl mb-4 shadow-sm">
                        <View className="bg-orange-400/30 h-8 w-8 rounded-full items-center justify-center mb-2">
                            <Ionicons name="receipt-outline" size={18} color="white"/>
                        </View>
                        <Text
                            className="text-orange-100 text-xs font-medium uppercase tracking-wider">{t('total_orders')}</Text>
                        <Text className="text-white text-2xl font-bold mt-1">{getTotalOrders()}</Text>
                    </View>

                    {/* 3. Total Products */}
                    <View className="bg-emerald-500 w-[48%] p-4 rounded-2xl mb-4 shadow-sm">
                        <View className="bg-emerald-400/30 h-8 w-8 rounded-full items-center justify-center mb-2">
                            <Ionicons name="cube-outline" size={18} color="white"/>
                        </View>
                        <Text
                            className="text-emerald-100 text-xs font-medium uppercase tracking-wider">{t('products')}</Text>
                        <Text className="text-white text-2xl font-bold mt-1">{products.length}</Text>
                    </View>

                    {/* 4. Recent Activity (Last Order Amount) */}
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

                {/* Quick Actions */}
                <Text className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    {t('quick_actions')}
                </Text>

                <View className="flex-row flex-wrap justify-between">
                    <QuickActionButton
                        icon="cart" label="new_sale"
                        color="#2563eb" onPress={() => router.push('/(tabs)/pos')}
                    />
                    <QuickActionButton
                        icon="cube" label="products"
                        color="#f59e0b" onPress={() => router.push('/(tabs)/products')}
                    />
                    <QuickActionButton
                        icon="document-text" label="history"
                        color="#10b981" onPress={() => router.push('/history')} // History Connected
                    />
                    <QuickActionButton
                        icon="settings" label="settings"
                        color="#64748b" onPress={() => router.push('/(tabs)/settings')}
                    />
                </View>

                {/* Recent Orders Preview (Optional) */}
                {orders.length > 0 && (
                    <View className="mt-4">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-lg font-bold text-slate-800 dark:text-white">Recent
                                Transactions</Text>
                            <TouchableOpacity onPress={() => router.push('/history')}>
                                <Text className="text-blue-600 font-bold text-sm">See All</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Show only top 3 recent orders */}
                        {orders.slice(0, 3).map((order) => (
                            <View key={order.id}
                                  className="flex-row justify-between items-center bg-white dark:bg-slate-900 p-3 mb-2 rounded-xl border border-gray-100 dark:border-slate-800">
                                <View className="flex-row items-center gap-3">
                                    <View className="bg-gray-100 dark:bg-slate-800 p-2 rounded-lg">
                                        <Ionicons name="bag-check" size={20} color="#2563eb"/>
                                    </View>
                                    <View>
                                        <Text className="text-slate-800 dark:text-white font-bold">Order
                                            #{order.id.slice(-4)}</Text>
                                        <Text
                                            className="text-slate-400 text-xs">{new Date(order.date).toLocaleTimeString()}</Text>
                                    </View>
                                </View>
                                <Text className="text-green-600 font-bold">৳ {order.totalAmount}</Text>
                            </View>
                        ))}
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}
const QuickActionButton = ({icon, label, onPress, color}: any) => {
    const {t} = useTranslation();
    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white dark:bg-slate-900 w-[48%] p-6 rounded-2xl mb-4 items-center justify-center shadow-sm border border-gray-100 dark:border-slate-800"
        >
            <Ionicons name={icon} size={32} color={color} style={{marginBottom: 8}}/>
            <Text className="font-semibold text-slate-700 dark:text-slate-200">
                {t(label)}
            </Text>
        </TouchableOpacity>
    );
};