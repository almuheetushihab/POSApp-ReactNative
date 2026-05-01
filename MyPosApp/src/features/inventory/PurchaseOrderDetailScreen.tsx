import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePurchaseOrderStore } from '../../store/usePurchaseOrderStore';
import { useSupplierStore } from '../../store/useSupplierStore';
import { PurchaseOrderStatus } from '../../types/purchaseOrder';

// Re-using the status styles from the list screen
const getStatusChipStyle = (status: PurchaseOrderStatus) => {
    switch (status) {
        case 'COMPLETED': return 'bg-green-100 dark:bg-green-900/30';
        case 'CANCELLED': return 'bg-red-100 dark:bg-red-900/30';
        default: return 'bg-yellow-100 dark:bg-yellow-900/30';
    }
};

const getStatusTextStyle = (status: PurchaseOrderStatus) => {
    switch (status) {
        case 'COMPLETED': return 'text-green-700 dark:text-green-400';
        case 'CANCELLED': return 'text-red-700 dark:text-red-400';
        default: return 'text-yellow-700 dark:text-yellow-500';
    }
};

export default function PurchaseOrderDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    
    const { getPurchaseOrderById, updatePurchaseOrderStatus } = usePurchaseOrderStore.getState();
    const { getSupplierById } = useSupplierStore.getState();

    const order = getPurchaseOrderById(id);
    const supplier = order ? getSupplierById(order.supplierId) : null;

    if (!order) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-gray-50 dark:bg-slate-950">
                <Text className="text-red-500">Purchase Order not found.</Text>
            </SafeAreaView>
        );
    }

    const handleUpdateStatus = (status: PurchaseOrderStatus) => {
        const action = status === 'COMPLETED' ? 'complete' : 'cancel';
        Alert.alert(
            `Confirm ${action}`,
            `Are you sure you want to ${action} this order? ${status === 'COMPLETED' ? 'This will add items to your stock.' : ''}`,
            [
                { text: "No", style: "cancel" },
                { 
                    text: "Yes", 
                    style: status === 'COMPLETED' ? "default" : "destructive", 
                    onPress: () => {
                        updatePurchaseOrderStatus(order.id, status);
                        router.back(); // Go back to the list after updating
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            {/* Header */}
            <View className="flex-row items-center p-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#64748b" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-800 dark:text-white">Order Details</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {/* Order Info */}
                <View className="bg-white dark:bg-slate-800 p-4 rounded-xl mb-4 shadow-sm border border-gray-100 dark:border-slate-700">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-sm text-slate-500">PO ID: {order.id}</Text>
                        <View className={`px-3 py-1 rounded-full ${getStatusChipStyle(order.status)}`}>
                            <Text className={`font-bold text-xs ${getStatusTextStyle(order.status)}`}>{order.status}</Text>
                        </View>
                    </View>
                    <Text className="text-xs text-slate-400 mt-2">
                        Ordered on: {new Date(order.orderDate).toLocaleString()}
                    </Text>
                    {order.completedDate && (
                        <Text className="text-xs text-slate-400">
                            Completed on: {new Date(order.completedDate).toLocaleString()}
                        </Text>
                    )}
                </View>

                {/* Supplier Info */}
                {supplier && (
                    <View className="bg-white dark:bg-slate-800 p-4 rounded-xl mb-4 shadow-sm border border-gray-100 dark:border-slate-700">
                        <Text className="text-lg font-bold text-slate-800 dark:text-white mb-2">Supplier</Text>
                        <Text className="text-base text-slate-700 dark:text-slate-300">{supplier.name}</Text>
                        <Text className="text-slate-500">{supplier.phone}</Text>
                        {supplier.address && <Text className="text-slate-500">{supplier.address}</Text>}
                    </View>
                )}

                {/* Items List */}
                <View className="bg-white dark:bg-slate-800 p-4 rounded-xl mb-4 shadow-sm border border-gray-100 dark:border-slate-700">
                    <Text className="text-lg font-bold text-slate-800 dark:text-white mb-3">Items ({order.items.length})</Text>
                    {order.items.map((item, index) => (
                        <View key={item.productId} className={`flex-row justify-between items-center py-3 ${index < order.items.length - 1 ? 'border-b border-gray-100 dark:border-slate-700' : ''}`}>
                            <View className="flex-1">
                                <Text className="font-bold text-slate-700 dark:text-slate-200">{item.productName}</Text>
                                <Text className="text-slate-500 text-sm">
                                    {item.quantity} x ৳{item.purchasePrice.toFixed(2)}
                                </Text>
                            </View>
                            <Text className="font-bold text-slate-800 dark:text-white">
                                ৳{(item.quantity * item.purchasePrice).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                    <View className="flex-row justify-between items-center pt-4 mt-4 border-t-2 border-gray-200 dark:border-slate-600">
                        <Text className="text-xl font-extrabold text-slate-800 dark:text-white">Total</Text>
                        <Text className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                            ৳{order.totalAmount.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Notes */}
                {order.notes && (
                    <View className="bg-white dark:bg-slate-800 p-4 rounded-xl mb-4 shadow-sm border border-gray-100 dark:border-slate-700">
                        <Text className="text-lg font-bold text-slate-800 dark:text-white mb-2">Notes</Text>
                        <Text className="text-slate-600 dark:text-slate-300">{order.notes}</Text>
                    </View>
                )}
            </ScrollView>

            {/* Action Buttons */}
            {order.status === 'PENDING' && (
                <View className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex-row gap-4">
                    <TouchableOpacity onPress={() => handleUpdateStatus('CANCELLED')} className="flex-1 bg-red-100 dark:bg-red-900/30 p-4 rounded-xl items-center border border-red-200 dark:border-red-800">
                        <Text className="text-red-600 dark:text-red-400 font-bold">Cancel Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleUpdateStatus('COMPLETED')} className="flex-1 bg-green-500 p-4 rounded-xl items-center">
                        <Text className="text-white font-bold">Mark as Completed</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
