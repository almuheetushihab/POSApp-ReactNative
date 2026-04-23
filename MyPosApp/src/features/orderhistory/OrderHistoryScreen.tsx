import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Modal, TextInput, ScrollView, Animated } from 'react-native';
import { useRouter } from "expo-router";
import { useOrderStore } from "../../store/useOrderStore";
import { Order, PaymentMethod } from "../../types/order";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { pdfService } from "../../services/pdfService";
import { useAuthStore } from "../../store/useAuthStore";

export default function OrderHistoryScreen() {
    const router = useRouter();
    const { orders, clearOrders, processRefund, processReturn, processExchange } = useOrderStore();
    const { hasPermission } = useAuthStore();
    
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
    const canClearHistory = hasPermission(['Admin']); // Only Admin can clear all history
    const canProcessRefund = hasPermission(['Admin', 'Manager']); // Only Admin and Manager can do full refund
    const canProcessReturn = hasPermission(['Admin', 'Manager', 'Cashier']); // Anyone can return items
    const canProcessExchange = hasPermission(['Admin', 'Manager', 'Cashier']); // Anyone can exchange items

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

    const getPaymentIcon = (method: string) => {
        switch(method) {
            case 'CASH': return 'cash-outline';
            case 'CARD': return 'card-outline';
            case 'MFS': return 'phone-portrait-outline';
            case 'SPLIT': return 'pie-chart-outline';
            default: return 'wallet-outline';
        }
    };

    const renderOrderItem = ({ item }: { item: Order }) => {
        const theme = getStatusTheme(item.status);
        const isStrikeThrough = item.status === 'REFUNDED' || item.status === 'RETURNED';

        return (
            <View className="mb-4">
                {/* Date Header (if we were grouping by date, for now just showing per item nicely) */}
                <View className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm overflow-hidden">
                    
                    {/* Top Section - Status Banner */}
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
                        {/* Header Info */}
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

                        {/* Customer Info (if exists) */}
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

                        {/* Items List */}
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

                            {/* Discounts & Taxes Summary if they exist */}
                            {(item.discount || item.tax) && (
                                <View className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 border-dashed">
                                    {item.discount && (
                                        <View className="flex-row justify-between items-center mb-1">
                                            <Text className="text-rose-500 text-xs font-medium">Discount</Text>
                                            <Text className="text-rose-500 text-xs font-bold">-৳{item.discount.amountCalculated.toFixed(2)}</Text>
                                        </View>
                                    )}
                                    {item.tax && (
                                        <View className="flex-row justify-between items-center">
                                            <Text className="text-slate-500 text-xs font-medium">Tax ({item.tax.taxRate}%)</Text>
                                            <Text className="text-slate-500 text-xs font-bold">৳{item.tax.taxAmount.toFixed(2)}</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

                        {/* Extended Payment/Refund Info Blocks */}
                        <View className="gap-2">
                            {/* Standard Card Details */}
                            {item.paymentMethod === 'CARD' && item.cardDetails && (
                                <View className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-xl flex-row items-center border border-indigo-100 dark:border-indigo-500/20">
                                    <Ionicons name="card" size={16} color="#6366f1" className="mr-2" />
                                    <View className="ml-2 flex-1">
                                        <Text className="text-indigo-800 dark:text-indigo-300 text-xs font-bold mb-0.5">{item.cardDetails.cardType || 'Card'} ending in **{item.cardDetails.lastFourDigits || 'XXXX'}</Text>
                                        {item.cardDetails.transactionId && <Text className="text-indigo-600/70 dark:text-indigo-400/70 text-[10px] uppercase tracking-wider">TXN: {item.cardDetails.transactionId}</Text>}
                                    </View>
                                </View>
                            )}

                            {/* Standard MFS Details */}
                            {item.paymentMethod === 'MFS' && item.mfsDetails && (
                                <View className="bg-rose-50 dark:bg-rose-500/10 p-3 rounded-xl flex-row items-center border border-rose-100 dark:border-rose-500/20">
                                    <Ionicons name="phone-portrait" size={16} color="#f43f5e" className="mr-2" />
                                    <View className="ml-2 flex-1">
                                        <Text className="text-rose-800 dark:text-rose-300 text-xs font-bold mb-0.5">{item.mfsDetails.mfsType || 'MFS'} • {item.mfsDetails.phoneNumber || 'N/A'}</Text>
                                        {item.mfsDetails.transactionId && <Text className="text-rose-600/70 dark:text-rose-400/70 text-[10px] uppercase tracking-wider">TXN: {item.mfsDetails.transactionId}</Text>}
                                    </View>
                                </View>
                            )}

                            {item.refundDetails && (
                                <View className="bg-rose-50 dark:bg-rose-500/10 p-3 rounded-xl flex-row items-start border border-rose-100 dark:border-rose-500/20">
                                    <Ionicons name="information-circle" size={16} color="#e11d48" className="mr-2 mt-0.5" />
                                    <View className="ml-2 flex-1">
                                        <Text className="text-rose-800 dark:text-rose-300 text-xs font-bold mb-0.5">Refunded</Text>
                                        <Text className="text-rose-600/80 dark:text-rose-400/80 text-[11px] leading-4">{item.refundDetails.reason}</Text>
                                    </View>
                                </View>
                            )}
                            
                            {item.exchangeDetails && (
                                <View className="bg-violet-50 dark:bg-violet-500/10 p-3 rounded-xl flex-row items-start border border-violet-100 dark:border-violet-500/20">
                                    <Ionicons name="swap-horizontal" size={16} color="#8b5cf6" className="mr-2 mt-0.5" />
                                    <View className="ml-2 flex-1">
                                        <Text className="text-violet-800 dark:text-violet-300 text-xs font-bold mb-0.5">Exchanged</Text>
                                        <Text className="text-violet-600/80 dark:text-violet-400/80 text-[11px] leading-4">{item.exchangeDetails.reason}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Footer Actions */}
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
            {/* Header */}
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
                            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Recorded
                        </Text>
                    </View>
                </View>

                {orders.length > 0 && canClearHistory && (
                    <TouchableOpacity
                        onPress={handleClearHistory}
                        className="h-10 w-10 bg-rose-50 dark:bg-rose-500/10 rounded-full items-center justify-center border border-rose-100 dark:border-rose-500/20 active:bg-rose-100"
                    >
                        <Ionicons name="trash-outline" size={20} color="#e11d48" />
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
                    <View className="flex-1 items-center justify-center mt-32 px-10">
                        <View className="bg-white dark:bg-slate-900 h-32 w-32 rounded-full items-center justify-center mb-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                            <Ionicons name="receipt-outline" size={48} color="#94a3b8" />
                        </View>
                        <Text className="text-slate-800 dark:text-white text-2xl font-black tracking-tight text-center">No sales history</Text>
                        <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-2 text-center leading-5">
                            When you complete checkout from the POS screen, your receipts will appear here.
                        </Text>
                    </View>
                }
            />

            {/* Action Modal (Choose Action) */}
            <Modal
                visible={isOptionsModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setOptionsModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-slate-900/60 backdrop-blur-sm p-6">
                    <View className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Order Action</Text>
                            <TouchableOpacity onPress={() => setOptionsModalVisible(false)} className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center">
                                <Ionicons name="close" size={18} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        
                        {selectedOrder && (
                            <View className="mb-6 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Order ID</Text>
                                    <Text className="text-slate-800 dark:text-slate-200 font-bold text-sm">#{selectedOrder.id.slice(-6).toUpperCase()}</Text>
                                </View>
                                <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Value</Text>
                                    <Text className="text-blue-600 dark:text-blue-400 font-black text-lg">৳{selectedOrder.totalAmount.toLocaleString()}</Text>
                                </View>
                            </View>
                        )}

                        <View className="gap-3">
                            {canProcessExchange && (
                                <TouchableOpacity 
                                    onPress={() => {
                                        setOptionsModalVisible(false);
                                        setExchangeModalVisible(true);
                                    }}
                                    className="bg-violet-500 py-4 rounded-2xl items-center flex-row justify-center gap-3 shadow-sm shadow-violet-500/30 active:bg-violet-600"
                                >
                                    <Ionicons name="swap-horizontal" size={20} color="white" />
                                    <Text className="text-white font-bold text-base tracking-wide">Exchange Products</Text>
                                </TouchableOpacity>
                            )}

                            {canProcessReturn && (
                                <TouchableOpacity 
                                    onPress={() => {
                                        setOptionsModalVisible(false);
                                        setReturnModalVisible(true);
                                    }}
                                    className="bg-amber-500 py-4 rounded-2xl items-center flex-row justify-center gap-3 shadow-sm shadow-amber-500/30 active:bg-amber-600"
                                >
                                    <Ionicons name="return-up-back" size={20} color="white" />
                                    <Text className="text-white font-bold text-base tracking-wide">Process Return</Text>
                                </TouchableOpacity>
                            )}
                            
                            {canProcessRefund ? (
                                <TouchableOpacity 
                                    onPress={() => {
                                        if(selectedOrder) handleFullRefund(selectedOrder);
                                    }}
                                    className="bg-rose-500 py-4 rounded-2xl items-center flex-row justify-center gap-3 shadow-sm shadow-rose-500/30 active:bg-rose-600 mt-2"
                                >
                                    <Ionicons name="cash" size={20} color="white" />
                                    <Text className="text-white font-bold text-base tracking-wide">Full Refund</Text>
                                </TouchableOpacity>
                            ) : (
                                <View className="bg-slate-100 dark:bg-slate-800 py-4 rounded-2xl items-center flex-row justify-center gap-2 mt-2 border border-slate-200 dark:border-slate-700 opacity-70">
                                    <Ionicons name="lock-closed" size={16} color="#94a3b8" />
                                    <Text className="text-slate-500 font-bold text-sm tracking-wide">Admin Full Refund</Text>
                                </View>
                            )}
                        </View>
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
                <View className="flex-1 justify-end bg-slate-900/60 backdrop-blur-sm">
                    <View className="bg-white dark:bg-slate-900 rounded-t-[32px] p-6 shadow-2xl min-h-[50%] border-t border-slate-200 dark:border-slate-800">
                         <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Process Return</Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Provide a reason for this return</Text>
                            </View>
                            <TouchableOpacity onPress={() => setReturnModalVisible(false)} className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center">
                                <Ionicons name="close" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-1">
                            <Text className="text-slate-700 dark:text-slate-300 font-bold text-sm mb-2 ml-1">Return Reason</Text>
                            <TextInput
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-slate-800 dark:text-white text-base mb-6 font-medium shadow-sm"
                                placeholder="e.g. Defective item, Changed mind..."
                                placeholderTextColor="#94a3b8"
                                multiline
                                numberOfLines={4}
                                value={returnReason}
                                onChangeText={setReturnReason}
                                textAlignVertical="top"
                            />
                        </View>

                        <TouchableOpacity 
                            onPress={submitReturn}
                            className="bg-amber-500 py-5 rounded-2xl items-center mt-auto shadow-lg shadow-amber-500/30 active:bg-amber-600"
                        >
                            <Text className="text-white font-black text-lg tracking-wide">Confirm Return</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Exchange Modal */}
            <Modal
                visible={isExchangeModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setExchangeModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-slate-900/60 backdrop-blur-sm">
                    <View className="bg-white dark:bg-slate-900 rounded-t-[32px] p-6 shadow-2xl min-h-[65%] border-t border-slate-200 dark:border-slate-800">
                         <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Product Exchange</Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Settle the price difference</Text>
                            </View>
                            <TouchableOpacity onPress={() => setExchangeModalVisible(false)} className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center">
                                <Ionicons name="close" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                            
                            <View className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-500/20 mb-6 flex-row items-start gap-3">
                                <Ionicons name="information-circle" size={20} color="#3b82f6" className="mt-0.5" />
                                <Text className="text-blue-800 dark:text-blue-300 text-xs font-medium flex-1 leading-5">
                                    Enter a <Text className="font-bold">positive number (+)</Text> if the customer owes money. Enter a <Text className="font-bold text-rose-600 dark:text-rose-400">negative number (-)</Text> if you owe the customer change.
                                </Text>
                            </View>

                            <Text className="text-slate-700 dark:text-slate-300 font-bold text-sm mb-2 ml-1">Price Difference (৳)</Text>
                            <TextInput
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-slate-800 dark:text-white text-xl mb-6 font-black shadow-sm"
                                placeholder="e.g. 500 or -200"
                                placeholderTextColor="#94a3b8"
                                keyboardType="numbers-and-punctuation"
                                value={priceDiff}
                                onChangeText={setPriceDiff}
                            />

                            <Text className="text-slate-700 dark:text-slate-300 font-bold text-sm mb-2 ml-1">Reason for Exchange</Text>
                            <TextInput
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-slate-800 dark:text-white text-base mb-8 font-medium shadow-sm"
                                placeholder="e.g. Size didn't fit, wrong color..."
                                placeholderTextColor="#94a3b8"
                                multiline
                                numberOfLines={3}
                                value={exchangeReason}
                                onChangeText={setExchangeReason}
                                textAlignVertical="top"
                            />

                            <TouchableOpacity 
                                onPress={submitExchange}
                                className="bg-violet-600 py-5 rounded-2xl items-center shadow-lg shadow-violet-500/30 active:bg-violet-700"
                            >
                                <Text className="text-white font-black text-lg tracking-wide">Confirm Exchange</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}