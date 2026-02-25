import React from 'react';
import {View, Text, FlatList, TouchableOpacity, Alert} from 'react-native';
import {useRouter} from "expo-router";
import {useOrderStore} from "../../store/useOrderStore";
import {Order} from "../../types/order";
import {Ionicons} from "@expo/vector-icons";
import {SafeAreaView} from "react-native-safe-area-context";
import {pdfService} from "../../services/pdfService";

export default function OrderHistoryScreen() {
    const router = useRouter();
    const {orders, clearOrders} = useOrderStore();

    const handleClearHistory = () => {
        Alert.alert(
            "Clear History",
            "Are you sure you want to delete all sales history? This cannot be undone.",
            [
                {text: "Cancel", style: "cancel"},
                {
                    text: "Clear All",
                    style: "destructive",
                    onPress: () => {
                        clearOrders();
                        Alert.alert("Success", "History cleared successfully.");
                    }
                }
            ]
        );
    };

    const renderOrderItem = ({item}: { item: Order }) => (
        <View
            className="bg-white dark:bg-slate-900 p-4 mb-3 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center gap-3">
                    <View className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-full">
                        <Ionicons name="receipt" size={20} color="#2563eb"/>
                    </View>
                    <View>
                        <Text className="text-slate-800 dark:text-white font-bold text-base">
                            #{item.id.slice(-6).toUpperCase()}
                        </Text>
                        <Text className="text-slate-500 text-xs font-medium">
                            {new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                        </Text>
                    </View>
                </View>

                {/* Print Button */}
                <TouchableOpacity
                    onPress={() => pdfService.printOrder(item)}
                    className="p-2 bg-gray-50 dark:bg-slate-800 rounded-full border border-gray-100 dark:border-slate-700 active:bg-blue-50"
                >
                    <Ionicons name="print-outline" size={20} color="#2563eb"/>
                </TouchableOpacity>
            </View>

            {/* Middle Row: Items Summary */}
            <View className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl mb-3">
                <Text className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold mb-1">Items</Text>
                <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-5">
                    {item.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                </Text>
            </View>

            {/* Bottom Row: Total & Status */}
            <View className="flex-row justify-between items-center pt-2 border-t border-gray-100 dark:border-slate-800">
                <View
                    className="bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-lg border border-green-100 dark:border-green-900/30">
                    <Text className="text-green-700 dark:text-green-400 text-xs font-bold uppercase">
                        PAID • {item.paymentMethod}
                    </Text>
                </View>
                <Text className="text-xl font-bold text-slate-800 dark:text-white">
                    ৳{item.totalAmount}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950" edges={['top']}>

            {/* Header */}
            <View
                className="flex-row items-center justify-between p-5 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm z-10">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full"
                    >
                        <Ionicons name="arrow-back" size={24} color="#64748b"/>
                    </TouchableOpacity>
                    <View>
                        <Text className="text-xl font-bold text-slate-800 dark:text-white">Sales History</Text>
                        <Text className="text-slate-500 text-xs font-medium">Total Orders: {orders.length}</Text>
                    </View>
                </View>

                {/* 🔥 ৩. ক্লিয়ার বাটন (শুধু যদি অর্ডার থাকে) */}
                {orders.length > 0 && (
                    <TouchableOpacity
                        onPress={handleClearHistory}
                        className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-100 dark:border-red-900/30"
                    >
                        <Ionicons name="trash-outline" size={22} color="#ef4444"/>
                    </TouchableOpacity>
                )}
            </View>

            {/* Orders List */}
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderItem}
                contentContainerStyle={{padding: 20, paddingBottom: 100}}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-32 opacity-50">
                        <View className="bg-gray-100 dark  :bg-slate-800 p-6 rounded-full mb-4">
                            <Ionicons name="receipt-outline" size={60} color="#94a3b8"/>
                        </View>
                        <Text className="text-slate-800 dark:text-white text-lg font-bold">No sales yet!</Text>
                        <Text className="text-slate-500 text-sm mt-1">Your completed orders will appear here.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}