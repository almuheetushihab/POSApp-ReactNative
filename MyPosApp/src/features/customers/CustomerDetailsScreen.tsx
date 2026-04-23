import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCustomerStore } from '../../store/useCustomerStore';
import { useOrderStore } from '../../store/useOrderStore';
import { Order } from '../../types/order';
import { AddEditCustomerModal } from './AddEditCustomerModal';
import { useSettingsStore } from '../../store/useSettingsStore';

export default function CustomerDetailsScreen() {
    const router = useRouter();
    const { customerId } = useLocalSearchParams();
    const { customers, deleteCustomer } = useCustomerStore();
    const { orders } = useOrderStore();
    const { stores } = useSettingsStore();
    
    const [isEditModalVisible, setEditModalVisible] = useState(false);

    const customer = customers.find(c => c.id === customerId);
    
    const { customerOrders, totalItems, lastVisit, frequentlyPurchased } = useMemo(() => {
        const filteredOrders = orders
            .filter(o => o.customer?.id === customerId || o.customer?.phone === customer?.phone)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        let total = 0;
        const itemCounts: { [key: string]: { name: string, count: number } } = {};

        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                total += item.quantity;
                if (itemCounts[item.id]) {
                    itemCounts[item.id].count += item.quantity;
                } else {
                    itemCounts[item.id] = { name: item.name, count: item.quantity };
                }
            });
        });

        const sortedItems = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 5);
        const lastOrderDate = filteredOrders.length > 0 ? new Date(filteredOrders[0].date).toLocaleDateString() : 'N/A';

        return {
            customerOrders: filteredOrders,
            totalItems: total,
            lastVisit: lastOrderDate,
            frequentlyPurchased: sortedItems
        };
    }, [orders, customerId, customer]);

    if (!customer) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center">
                <Text className="text-red-500">Customer not found!</Text>
            </SafeAreaView>
        );
    }

    const handleDelete = () => {
        Alert.alert(
            "Delete Customer",
            `Are you sure you want to delete ${customer.name}? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        if (customer.id) {
                            deleteCustomer(customer.id);
                            router.back();
                            Alert.alert("Success", "Customer has been deleted.");
                        }
                    }
                }
            ]
        );
    };

    const renderOrderItem = ({ item }: { item: Order }) => {
        const store = stores.find(s => s.id === item.storeId);
        return (
            <View className="bg-white dark:bg-slate-900 p-4 mb-3 rounded-2xl border border-gray-100 dark:border-slate-800">
                <View className="flex-row justify-between items-center mb-3">
                    <View>
                        <Text className="text-slate-800 dark:text-white font-bold">#{item.id.slice(-6).toUpperCase()}</Text>
                        <Text className="text-slate-500 text-xs">{new Date(item.date).toLocaleDateString()}</Text>
                    </View>
                    {store && (
                        <View className="flex-row items-center bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                            <Ionicons name="storefront-outline" size={12} color="#64748b" />
                            <Text className="text-slate-600 dark:text-slate-300 text-xs ml-1">{store.name}</Text>
                        </View>
                    )}
                </View>
                <View className="border-t border-gray-100 dark:border-slate-800 pt-2">
                    {item.items.map((p, index) => (
                        <Text key={index} className="text-slate-600 dark:text-slate-300 text-sm">
                            {p.quantity}x {p.name}
                        </Text>
                    ))}
                </View>
                <View className="flex-row justify-between items-center pt-3 mt-2 border-t border-dashed border-gray-200 dark:border-slate-700">
                    <Text className="text-slate-500 font-medium">Total</Text>
                    <Text className="text-blue-600 font-bold text-lg">৳{item.totalAmount.toFixed(2)}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950" edges={['top']}>
            <View className="flex-row items-center justify-between p-5 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-full">
                        <Ionicons name="arrow-back" size={24} color="#64748b" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-slate-800 dark:text-white">Customer Dashboard</Text>
                </View>
                <View className="flex-row gap-2">
                    <TouchableOpacity onPress={() => setEditModalVisible(true)} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full">
                        <Ionicons name="pencil" size={20} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full">
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="p-5">
                    <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-slate-800">
                        <View className="flex-row items-center mb-4">
                            <View className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-4 border-4 border-white dark:border-slate-900">
                                <Ionicons name="person" size={32} color="#2563eb" />
                            </View>
                            <View>
                                <Text className="text-xl font-bold text-slate-800 dark:text-white">{customer.name}</Text>
                                <Text className="text-slate-500 font-medium">{customer.phone}</Text>
                                {customer.email && <Text className="text-slate-400 text-xs">{customer.email}</Text>}
                            </View>
                        </View>
                        <View className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <StatCard label="Total Spent" value={`৳${customer.totalSpent?.toFixed(0) || 0}`} icon="cash" color="text-green-600" />
                            <StatCard label="Loyalty Points" value={customer.loyaltyPoints || 0} icon="star" color="text-amber-600" />
                            <StatCard label="Total Orders" value={customerOrders.length} icon="receipt" color="text-blue-600" />
                            <StatCard label="Total Items" value={totalItems} icon="cube" color="text-purple-600" />
                            <StatCard label="Last Visit" value={lastVisit} icon="calendar" color="text-cyan-600" isSmallText={true} />
                        </View>
                    </View>
                </View>

                {frequentlyPurchased.length > 0 && (
                    <View className="px-5 mb-5">
                        <Text className="text-slate-500 dark:text-slate-400 font-bold mb-3 uppercase text-xs tracking-widest">
                            Frequently Purchased
                        </Text>
                        <View className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-slate-800">
                            {frequentlyPurchased.map((item, index) => (
                                <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-50 dark:border-slate-800 last:border-0">
                                    <Text className="text-slate-700 dark:text-slate-300 font-medium">{item.name}</Text>
                                    <Text className="text-slate-500 font-bold">{item.count} times</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <Text className="text-slate-500 dark:text-slate-400 font-bold mb-3 uppercase text-xs tracking-widest px-5">
                    Purchase History
                </Text>

                <FlatList
                    data={customerOrders}
                    scrollEnabled={false} // Disable FlatList scrolling, rely on ScrollView
                    keyExtractor={(item) => item.id}
                    renderItem={renderOrderItem}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-10">
                            <Ionicons name="receipt-outline" size={40} color="#cbd5e1" />
                            <Text className="text-slate-400 mt-2">No orders from this customer yet.</Text>
                        </View>
                    }
                />
            </ScrollView>

            <AddEditCustomerModal 
                visible={isEditModalVisible}
                onClose={() => setEditModalVisible(false)}
                customerToEdit={customer}
            />
        </SafeAreaView>
    );
}

const StatCard = ({ label, value, icon, color, isSmallText = false }: any) => (
    <View className="items-center bg-gray-50 dark:bg-slate-800/50 p-2 rounded-lg">
        <Ionicons name={icon} size={16} className={`mb-1 ${color}`} />
        <Text className="text-slate-500 text-[10px] uppercase font-bold">{label}</Text>
        <Text className={`${color} font-black ${isSmallText ? 'text-xs' : 'text-xl'} mt-1`}>{value}</Text>
    </View>
);