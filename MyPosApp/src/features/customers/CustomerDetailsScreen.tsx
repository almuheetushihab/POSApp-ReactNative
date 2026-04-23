import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCustomerStore } from '../../store/useCustomerStore';
import { useOrderStore } from '../../store/useOrderStore';
import { Order } from '../../types/order';

export default function CustomerDetailsScreen() {
    const router = useRouter();
    const { customerId } = useLocalSearchParams();
    const { customers } = useCustomerStore();
    const { orders } = useOrderStore();

    const customer = customers.find(c => c.id === customerId);
    const customerOrders = orders.filter(o => o.customer?.id === customerId || o.customer?.phone === customer?.phone).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (!customer) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center">
                <Text className="text-red-500">Customer not found!</Text>
            </SafeAreaView>
        );
    }

    const renderOrderItem = ({ item }: { item: Order }) => (
        <View className="bg-white dark:bg-slate-900 p-4 mb-3 rounded-2xl border border-gray-100 dark:border-slate-800">
            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-slate-800 dark:text-white font-bold">#{item.id.slice(-6).toUpperCase()}</Text>
                <Text className="text-slate-500 text-xs">{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <Text className="text-slate-600 dark:text-slate-300 mb-2">
                {item.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
            </Text>
            <View className="flex-row justify-between items-center pt-2 border-t border-gray-100 dark:border-slate-800">
                <Text className="text-slate-500 font-medium">Total</Text>
                <Text className="text-blue-600 font-bold text-lg">৳{item.totalAmount.toFixed(2)}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950" edges={['top']}>
            {/* Header */}
            <View className="flex-row items-center p-5 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="#64748b" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-slate-800 dark:text-white">Customer Profile</Text>
            </View>

            {/* Customer Info Card */}
            <View className="p-5">
                <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-slate-800">
                    <View className="flex-row items-center mb-4">
                        <View className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-4 border-4 border-white dark:border-slate-900">
                            <Ionicons name="person" size={32} color="#2563eb" />
                        </View>
                        <View>
                            <Text className="text-xl font-bold text-slate-800 dark:text-white">{customer.name}</Text>
                            <Text className="text-slate-500 font-medium">{customer.phone}</Text>
                        </View>
                    </View>
                    <View className="flex-row justify-around pt-4 border-t border-gray-100 dark:border-slate-800">
                        <View className="items-center">
                            <Text className="text-slate-500 text-xs uppercase font-bold">Total Spent</Text>
                            <Text className="text-green-600 font-black text-xl mt-1">৳{customer.totalSpent?.toFixed(0) || 0}</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-slate-500 text-xs uppercase font-bold">Loyalty Points</Text>
                            <Text className="text-amber-600 font-black text-xl mt-1">{customer.loyaltyPoints || 0}</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-slate-500 text-xs uppercase font-bold">Total Orders</Text>
                            <Text className="text-blue-600 font-black text-xl mt-1">{customerOrders.length}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <Text className="text-slate-500 dark:text-slate-400 font-bold mb-3 uppercase text-xs tracking-widest px-5">
                Purchase History
            </Text>

            <FlatList
                data={customerOrders}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderItem}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-10">
                        <Ionicons name="receipt-outline" size={40} color="#cbd5e1" />
                        <Text className="text-slate-400 mt-2">No orders from this customer yet.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}