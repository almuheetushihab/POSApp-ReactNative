import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from "expo-router";
import { useOrderStore } from "../../store/useOrderStore";
import { Order } from "../../types/order";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { pdfService } from "../../services/pdfService";

export default function OrderHistoryScreen() {
    const router = useRouter();
    const { orders, clearOrders, processRefund, processReturn } = useOrderStore();
    
    // Modal states
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isRefundModalVisible, setRefundModalVisible] = useState(false);
    const [isReturnModalVisible, setReturnModalVisible] = useState(false);
    const [returnReason, setReturnReason] = useState('');

    const handleClearHistory = () => {
        Alert.alert(
            "Clear History",
            "Are you sure you want to delete all sales history? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
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

    const handleFullRefund = (order: Order) => {
        Alert.alert(
            "Process Refund",
            `Are you sure you want to fully refund ৳${order.totalAmount}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Refund",
                    style: "destructive",
                    onPress: () => {
                        processRefund(order.id, {
                            refundDate: new Date().toISOString(),
                            refundedAmount: order.totalAmount,
                            reason: 'Customer requested full refund'
                        });
                        setRefundModalVisible(false);
                        Alert.alert("Success", "Order fully refunded.");
                    }
                }
            ]
        );
    };

    const submitReturn = () => {
        if (selectedOrder) {
            processReturn(selectedOrder.id, returnReason || 'Customer returned items');
            setReturnModalVisible(false);
            setReturnReason('');
            Alert.alert("Success", "Order marked as returned.");
        }
    };

    const openOptionsModal = (order: Order) => {
        if(order.status === 'COMPLETED') {
             setSelectedOrder(order);
             setRefundModalVisible(true);
        } else {
             Alert.alert("Info", `This order is already ${order.status.toLowerCase()}`);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-100 dark:border-green-900/30', text: 'text-green-700 dark:text-green-400' };
            case 'REFUNDED':
                return { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-100 dark:border-red-900/30', text: 'text-red-700 dark:text-red-400' };
            case 'RETURNED':
                return { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-100 dark:border-orange-900/30', text: 'text-orange-700 dark:text-orange-400' };
            case 'PARTIAL_RETURN':
                return { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-100 dark:border-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' };
            default:
                return { bg: 'bg-gray-50 dark:bg-gray-900/20', border: 'border-gray-100 dark:border-gray-900/30', text: 'text-gray-700 dark:text-gray-400' };
        }
    };

    const renderOrderItem = ({ item }: { item: Order }) => {
        const statusStyle = getStatusStyle(item.status);

        return (
            <TouchableOpacity 
                activeOpacity={0.7}
                onLongPress={() => openOptionsModal(item)}
                className="bg-white dark:bg-slate-900 p-4 mb-3 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm"
            >
                <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center gap-3">
                        <View className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-full">
                            <Ionicons name="receipt" size={20} color="#2563eb" />
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

                    <View className="flex-row gap-2">
                        {item.status === 'COMPLETED' && (
                             <TouchableOpacity
                                onPress={() => openOptionsModal(item)}
                                className="p-2 bg-rose-50 dark:bg-slate-800 rounded-full border border-rose-100 dark:border-slate-700 active:bg-rose-100"
                            >
                                <Ionicons name="arrow-undo-outline" size={20} color="#e11d48" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => pdfService.printOrder(item)}
                            className="p-2 bg-gray-50 dark:bg-slate-800 rounded-full border border-gray-100 dark:border-slate-700 active:bg-blue-50"
                        >
                            <Ionicons name="print-outline" size={20} color="#2563eb" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Middle Row: Items Summary */}
                <View className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl mb-3">
                    <Text className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold mb-1">Items</Text>
                    <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-5">
                        {item.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </Text>
                    {item.refundDetails && (
                        <Text className="text-rose-600 dark:text-rose-400 text-xs font-medium mt-2">
                            Reason: {item.refundDetails.reason}
                        </Text>
                    )}
                </View>

                {/* Bottom Row: Total & Status */}
                <View className="flex-row justify-between items-center pt-2 border-t border-gray-100 dark:border-slate-800">
                    <View className={`${statusStyle.bg} px-2.5 py-1 rounded-lg border ${statusStyle.border}`}>
                        <Text className={`${statusStyle.text} text-xs font-bold uppercase`}>
                            {item.status} • {item.paymentMethod}
                        </Text>
                    </View>
                    <Text className={`text-xl font-bold ${item.status === 'COMPLETED' ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500 line-through'}`}>
                        ৳{item.totalAmount}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950" edges={['top']}>
            {/* Header */}
            <View className="flex-row items-center justify-between p-5 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm z-10">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full"
                    >
                        <Ionicons name="arrow-back" size={24} color="#64748b" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-xl font-bold text-slate-800 dark:text-white">Sales History</Text>
                        <Text className="text-slate-500 text-xs font-medium">Total Orders: {orders.length}</Text>
                    </View>
                </View>

                {orders.length > 0 && (
                    <TouchableOpacity
                        onPress={handleClearHistory}
                        className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-100 dark:border-red-900/30"
                    >
                        <Ionicons name="trash-outline" size={22} color="#ef4444" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Orders List */}
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderItem}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-32 opacity-50">
                        <View className="bg-gray-100 dark:bg-slate-800 p-6 rounded-full mb-4">
                            <Ionicons name="receipt-outline" size={60} color="#94a3b8" />
                        </View>
                        <Text className="text-slate-800 dark:text-white text-lg font-bold">No sales yet!</Text>
                        <Text className="text-slate-500 text-sm mt-1">Your completed orders will appear here.</Text>
                    </View>
                }
            />

            {/* Action Modal (Choose Refund or Return) */}
            <Modal
                visible={isRefundModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setRefundModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50 p-5">
                    <View className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-xl">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-slate-800 dark:text-white">Order Options</Text>
                            <TouchableOpacity onPress={() => setRefundModalVisible(false)} className="p-2">
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        
                        {selectedOrder && (
                            <View className="mb-6 bg-gray-50 dark:bg-slate-800 p-4 rounded-xl">
                                <Text className="text-slate-600 dark:text-slate-400 text-sm">Order ID: #{selectedOrder.id.slice(-6).toUpperCase()}</Text>
                                <Text className="text-slate-800 dark:text-slate-200 font-bold text-lg mt-1">Amount: ৳{selectedOrder.totalAmount}</Text>
                            </View>
                        )}

                        <TouchableOpacity 
                            onPress={() => {
                                if(selectedOrder) handleFullRefund(selectedOrder);
                            }}
                            className="bg-rose-500 py-4 rounded-xl items-center mb-3 flex-row justify-center gap-2"
                        >
                            <Ionicons name="cash-outline" size={20} color="white" />
                            <Text className="text-white font-bold text-base">Full Refund (Cash Back)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={() => {
                                setRefundModalVisible(false);
                                setReturnModalVisible(true);
                            }}
                            className="bg-orange-500 py-4 rounded-xl items-center flex-row justify-center gap-2"
                        >
                            <Ionicons name="cube-outline" size={20} color="white" />
                            <Text className="text-white font-bold text-base">Process Return (Items back)</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Return Reason Modal */}
            <Modal
                visible={isReturnModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setReturnModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 shadow-xl min-h-[50%]">
                         <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-slate-800 dark:text-white">Return Details</Text>
                            <TouchableOpacity onPress={() => setReturnModalVisible(false)} className="p-2">
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-slate-700 dark:text-slate-300 font-bold mb-2">Reason for Return</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white text-base mb-6"
                            placeholder="e.g. Defective item, Changed mind..."
                            placeholderTextColor="#94a3b8"
                            multiline
                            numberOfLines={4}
                            value={returnReason}
                            onChangeText={setReturnReason}
                            textAlignVertical="top"
                        />

                        <TouchableOpacity 
                            onPress={submitReturn}
                            className="bg-blue-600 py-4 rounded-xl items-center mt-auto"
                        >
                            <Text className="text-white font-bold text-lg">Confirm Return</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}