import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePurchaseOrderStore } from '../../store/usePurchaseOrderStore';
import { PurchaseOrder, PurchaseOrderStatus } from '../../types/purchaseOrder';
import { useSupplierStore } from '../../store/useSupplierStore';

const getStatusChipStyle = (status: PurchaseOrderStatus) => {
    switch (status) {
        case 'COMPLETED':
            return 'bg-green-100 dark:bg-green-900/30';
        case 'CANCELLED':
            return 'bg-red-100 dark:bg-red-900/30';
        case 'PENDING':
        default:
            return 'bg-yellow-100 dark:bg-yellow-900/30';
    }
};

const getStatusTextStyle = (status: PurchaseOrderStatus) => {
    switch (status) {
        case 'COMPLETED':
            return 'text-green-700 dark:text-green-400';
        case 'CANCELLED':
            return 'text-red-700 dark:text-red-400';
        case 'PENDING':
        default:
            return 'text-yellow-700 dark:text-yellow-500';
    }
};

const PurchaseOrderCard = ({ order, onUpdateStatus }: { order: PurchaseOrder, onUpdateStatus: (id: string, status: PurchaseOrderStatus) => void }) => {
    const { getSupplierById } = useSupplierStore.getState();
    const supplier = getSupplierById(order.supplierId);

    return (
        <View className="bg-white dark:bg-slate-800 p-4 rounded-xl mb-3 shadow-sm border border-gray-100 dark:border-slate-700">
            <View className="flex-row justify-between items-start mb-3">
                <View>
                    <Text className="text-sm text-slate-500">PO ID: {order.id}</Text>
                    <Text className="text-lg font-bold text-slate-800 dark:text-white">{supplier?.name || 'Unknown Supplier'}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${getStatusChipStyle(order.status)}`}>
                    <Text className={`font-bold text-xs ${getStatusTextStyle(order.status)}`}>{order.status}</Text>
                </View>
            </View>
            <View className="border-t border-gray-100 dark:border-slate-700 pt-3">
                <Text className="text-slate-600 dark:text-slate-300 font-bold mb-2">Items ({order.items.length})</Text>
                {order.items.slice(0, 2).map(item => (
                    <View key={item.productId} className="flex-row justify-between">
                        <Text className="text-slate-500 dark:text-slate-400">{item.productName}</Text>
                        <Text className="text-slate-500 dark:text-slate-400">Qty: {item.quantity}</Text>
                    </View>
                ))}
                {order.items.length > 2 && <Text className="text-slate-400 text-xs mt-1">...and {order.items.length - 2} more</Text>}
            </View>
            <View className="border-t border-gray-100 dark:border-slate-700 mt-3 pt-3 flex-row justify-between items-center">
                <Text className="text-lg font-bold text-blue-600 dark:text-blue-400">৳{order.totalAmount.toFixed(2)}</Text>
                {order.status === 'PENDING' && (
                    <View className="flex-row gap-2">
                        <TouchableOpacity onPress={() => onUpdateStatus(order.id, 'COMPLETED')} className="bg-green-500 p-2 rounded-lg">
                            <Ionicons name="checkmark-done" size={20} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onUpdateStatus(order.id, 'CANCELLED')} className="bg-red-500 p-2 rounded-lg">
                            <Ionicons name="close" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

export default function PurchaseOrderListScreen() {
    const router = useRouter();
    const { purchaseOrders, fetchPurchaseOrders, updatePurchaseOrderStatus } = usePurchaseOrderStore();

    useEffect(() => {
        fetchPurchaseOrders();
    }, []);

    const handleUpdateStatus = (orderId: string, status: PurchaseOrderStatus) => {
        const action = status === 'COMPLETED' ? 'complete' : 'cancel';
        Alert.alert(
            `Confirm ${action}`,
            `Are you sure you want to ${action} this order? ${status === 'COMPLETED' ? 'This will add items to your stock.' : ''}`,
            [
                { text: "No", style: "cancel" },
                { 
                    text: "Yes", 
                    style: status === 'COMPLETED' ? "default" : "destructive", 
                    onPress: () => updatePurchaseOrderStatus(orderId, status) 
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            <View className="flex-row justify-between items-center p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
                <Text className="text-2xl font-bold text-slate-800 dark:text-white">Purchase Orders</Text>
                <TouchableOpacity onPress={() => router.push('/inventory/create-po')} className="bg-blue-600 px-4 py-2 rounded-lg">
                    <Text className="text-white font-bold">Create New</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={purchaseOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                    <PurchaseOrderCard order={item} onUpdateStatus={handleUpdateStatus} />
                )}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center mt-20">
                        <Ionicons name="receipt-outline" size={50} color="#cbd5e1" />
                        <Text className="text-slate-400 mt-2">No purchase orders found.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
