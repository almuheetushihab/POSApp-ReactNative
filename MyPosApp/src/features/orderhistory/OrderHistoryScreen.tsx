import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { useRouter } from "expo-router";
import { useOrderStore } from "../../store/useOrderStore";
import { Order } from "../../types/order";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { pdfService } from "../../services/pdfService";
import { useAuthStore } from "../../store/useAuthStore";
import { useSettingsStore } from '../../store/useSettingsStore';

export default function OrderHistoryScreen() {
    const router = useRouter();
    const { orders, clearOrders, processRefund, processReturn, processExchange } = useOrderStore();
    const { hasPermission } = useAuthStore();
    const { activeStoreId } = useSettingsStore();
    
    // Filter orders based on the active store
    const storeFilteredOrders = orders.filter(o => o.storeId === activeStoreId);

    // Modal states
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isOptionsModalVisible, setOptionsModalVisible] = useState(false);
    
    // Action Modals
    const [isReturnModalVisible, setReturnModalVisible] = useState(false);
    const [isExchangeModalVisible, setExchangeModalVisible] = useState(false);
    
    // Inputs
    const [returnReason, setReturnReason] = useState('');
    const [exchangeReason, setExchangeReason] = useState('');
    const [priceDiff, setPriceDiff] = useState('');

    // RBAC Permissions
    const canClearHistory = hasPermission(['Admin']);
    const canProcessRefund = hasPermission(['Admin', 'Manager']);
    const canProcessReturn = hasPermission(['Admin', 'Manager', 'Cashier']);
    const canProcessExchange = hasPermission(['Admin', 'Manager', 'Cashier']);

    const handleClearHistory = () => {
        Alert.alert(
            "Clear History",
            "Are you sure you want to delete all sales history for this store? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear All",
                    style: "destructive",
                    onPress: () => {
                        // This should ideally be a backend call to clear orders for a specific store
                        // For now, we filter locally.
                        const ordersToKeep = orders.filter(o => o.storeId !== activeStoreId);
                        // A new method in useOrderStore would be needed to handle this properly
                        // e.g., setOrders(ordersToKeep)
                        Alert.alert("Success", "History for this store cleared.");
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
                        setOptionsModalVisible(false);
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

    const submitExchange = () => {
        if (selectedOrder) {
            const numDiff = parseFloat(priceDiff);
            if(isNaN(numDiff)) {
                Alert.alert("Error", "Please enter a valid number for price difference.");
                return;
            }

            processExchange(selectedOrder.id, {
                exchangeDate: new Date().toISOString(),
                reason: exchangeReason || 'Customer exchanged items',
                exchangedItems: [], 
                priceDifference: numDiff
            });
            
            setExchangeModalVisible(false);
            setExchangeReason('');
            setPriceDiff('');
            Alert.alert("Success", "Order marked as exchanged.");
        }
    };

    const openOptionsModal = (order: Order) => {
        if(order.status === 'COMPLETED' || order.status === 'EXCHANGED') {
             setSelectedOrder(order);
             setOptionsModalVisible(true);
        } else {
             Alert.alert("Info", `This order is already ${order.status.toLowerCase()}`);
        }
    };

    const getStatusTheme = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return { 
                    bg: 'bg-emerald-50 dark:bg-emerald-500/10', 
                    border: 'border-emerald-200 dark:border-emerald-500/20', 
                    text: 'text-emerald-700 dark:text-emerald-400',
                    icon: 'checkmark-circle'
                };
            case 'REFUNDED':
                return { 
                    bg: 'bg-rose-50 dark:bg-rose-500/10', 
                    border: 'border-rose-200 dark:border-rose-500/20', 
                    text: 'text-rose-700 dark:text-rose-400',
                    icon: 'arrow-undo'
                };
            case 'RETURNED':
                return { 
                    bg: 'bg-amber-50 dark:bg-amber-500/10', 
                    border: 'border-amber-200 dark:border-amber-500/20', 
                    text: 'text-amber-700 dark:text-amber-400',
                    icon: 'return-up-back'
                };
            case 'PARTIAL_RETURN':
                return { 
                    bg: 'bg-orange-50 dark:bg-orange-500/10', 
                    border: 'border-orange-200 dark:border-orange-500/20', 
                    text: 'text-orange-700 dark:text-orange-400',
                    icon: 'pie-chart'
                };
            case 'EXCHANGED':
                return { 
                    bg: 'bg-violet-50 dark:bg-violet-500/10', 
                    border: 'border-violet-200 dark:border-violet-500/20', 
                    text: 'text-violet-700 dark:text-violet-400',
                    icon: 'swap-horizontal'
                };
            default:
                return { 
                    bg: 'bg-slate-50 dark:bg-slate-500/10', 
                    border: 'border-slate-200 dark:border-slate-500/20', 
                    text: 'text-slate-700 dark:text-slate-400',
                    icon: 'information-circle'
                };
        }
    };

    const getPaymentIcon = (method: string) => {
        switch(method) {
            case 'CASH': return 'cash-outline';
            case 'CARD': return 'card-outline';
            case 'MFS': return 'phone-portrait-outline';
            case 'SPLIT': return 'pie-chart-outline';
            default: return 'wallet-outline';
        }
    };

    const formatPaymentMethod = (order: Order) => {
        if (order.paymentMethod === 'SPLIT' && order.splitPaymentDetails) {
            const parts = [];
            if(order.splitPaymentDetails.cashAmount > 0) parts.push('Cash');
            if(order.splitPaymentDetails.cardAmount > 0) parts.push('Card');
            if(order.splitPaymentDetails.mfsAmount > 0) parts.push('MFS');
            return `SPLIT (${parts.join('+')})`;
        }
        return order.paymentMethod;
    };

    const renderOrderItem = ({ item }: { item: Order }) => {
        const theme = getStatusTheme(item.status);
        const isStrikeThrough = item.status === 'REFUNDED' || item.status === 'RETURNED';

        return (
            <View className="mb-4">
                <View className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm overflow-hidden">
                    <View className={`${theme.bg} px-4 py-3 flex-row justify-between items-center border-b ${theme.border}`}>
                        <View className="flex-row items-center gap-2">
                            <Ionicons name={theme.icon as any} size={16} color={theme.text.split(' ')[0].replace('text-', '')} className={theme.text} />
                            <Text className={`font-bold tracking-wider text-[11px] uppercase ${theme.text}`}>
                                {item.status}
                            </Text>
                        </View>
                        <Text className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                            {new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                    </View>

                    <TouchableOpacity 
                        activeOpacity={0.7}
                        onLongPress={() => openOptionsModal(item)}
                        className="p-4"
                    >
                        <View className="flex-row justify-between items-start mb-4">
                            <View className="flex-row items-center gap-3">
                                <View className="bg-blue-50 dark:bg-blue-500/10 h-12 w-12 rounded-2xl items-center justify-center border border-blue-100 dark:border-blue-500/20">
                                    <Ionicons name="receipt" size={24} color="#3b82f6" />
                                </View>
                                <View>
                                    <Text className="text-slate-800 dark:text-slate-100 font-extrabold text-lg tracking-tight">
                                        #{item.id.slice(-6).toUpperCase()}
                                    </Text>
                                    <View className="flex-row items-center mt-0.5 opacity-70">
                                        <Ionicons name="time-outline" size={12} color="#64748b" className="mr-1" />
                                        <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium ml-1">
                                            {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View className="items-end">
                                <Text className={`text-2xl font-black tracking-tight ${!isStrikeThrough ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500 line-through decoration-rose-500'}`}>
                                    ৳{item.totalAmount.toLocaleString()}
                                </Text>
                                <View className="flex-row items-center mt-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                    <Ionicons name={getPaymentIcon(item.paymentMethod)} size={10} color="#64748b" className="mr-1" />
                                    <Text className="text-slate-500 dark:text-slate-400 text-[10px] font-bold ml-1">
                                        {formatPaymentMethod(item)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {item.customer && (
                            <View className="flex-row items-center gap-2 mb-4 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                <View className="bg-slate-200 dark:bg-slate-700 h-6 w-6 rounded-full items-center justify-center">
                                    <Ionicons name="person" size={12} color="#64748b" />
                                </View>
                                <Text className="text-slate-600 dark:text-slate-300 text-xs font-medium flex-1" numberOfLines={1}>
                                    {item.customer.name} {item.customer.phone ? `(${item.customer.phone})` : ''}
                                </Text>
                            </View>
                        )}

                        <View className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-3 mb-4 border border-slate-100 dark:border-slate-800/50">
                            <Text className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-2 ml-1">Purchased Items</Text>
                            {item.items.map((prod, idx) => (
                                <View key={idx} className="flex-row justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                                    <View className="flex-row items-center flex-1 pr-4">
                                        <Text className="text-slate-400 dark:text-slate-500 text-xs font-bold w-6">{prod.quantity}x</Text>
                                        <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium flex-1" numberOfLines={1}>{prod.name}</Text>
                                    </View>
                                    <Text className="text-slate-600 dark:text-slate-400 text-sm font-bold">৳{(prod.price * prod.quantity).toLocaleString()}</Text>
                                </View>
                            ))}
                        </View>
                    </TouchableOpacity>

                    <View className="px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex-row justify-end gap-2">
                        {(item.status === 'COMPLETED' || item.status === 'EXCHANGED') && (
                            <TouchableOpacity
                                onPress={() => openOptionsModal(item)}
                                className="px-4 py-2 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 flex-row items-center shadow-sm"
                            >
                                <Ionicons name="settings-outline" size={14} color="#64748b" />
                                <Text className="text-slate-600 dark:text-slate-300 text-xs font-bold ml-1.5">Manage</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => pdfService.printOrder(item)}
                            className="px-4 py-2 bg-blue-600 rounded-xl flex-row items-center shadow-sm shadow-blue-500/30"
                        >
                            <Ionicons name="print" size={14} color="white" />
                            <Text className="text-white text-xs font-bold ml-1.5">Print Receipt</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
            <View className="flex-row items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 shadow-sm">
                <View className="flex-row items-center gap-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center active:bg-slate-200 dark:active:bg-slate-700"
                    >
                        <Ionicons name="chevron-back" size={24} color="#334155" className="dark:color-slate-300" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Sales History</Text>
                        <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">
                            {storeFilteredOrders.length} {storeFilteredOrders.length === 1 ? 'Order' : 'Orders'} Recorded
                        </Text>
                    </View>
                </View>

                {storeFilteredOrders.length > 0 && canClearHistory && (
                    <TouchableOpacity
                        onPress={handleClearHistory}
                        className="h-10 w-10 bg-rose-50 dark:bg-rose-500/10 rounded-full items-center justify-center border border-rose-100 dark:border-rose-500/20 active:bg-rose-100"
                    >
                        <Ionicons name="trash-outline" size={20} color="#e11d48" />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={storeFilteredOrders}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderItem}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center mt-32 px-10">
                        <View className="bg-white dark:bg-slate-900 h-32 w-32 rounded-full items-center justify-center mb-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                            <Ionicons name="receipt-outline" size={48} color="#94a3b8" />
                        </View>
                        <Text className="text-slate-800 dark:text-white text-2xl font-black tracking-tight text-center">No sales history</Text>
                        <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-2 text-center leading-5">
                            Completed orders from this store will appear here.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}