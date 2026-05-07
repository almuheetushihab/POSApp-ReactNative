import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Modal, TextInput, ScrollView, useColorScheme, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from "expo-router";
import { useOrderStore } from "../../store/useOrderStore";
import { Order, PaymentMethod, SplitPaymentDetails, CardPaymentDetails, MFSPaymentDetails } from "../../types/order";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { pdfService } from "../../services/pdfService";
import { useAuthStore } from "../../store/useAuthStore";
import { useProductStore } from "../../store/useProductStore";
import { Product } from '../../types/product';
import { CartItem } from '../../types/carts';
import { PaymentProcessingModal } from '../../components/PaymentProcessingModal';

interface ExchangePair {
    id: string;
    returnItem: CartItem;
    newProduct: Product;
    quantity: number;
}

export default function OrderHistoryScreen() {
    const router = useRouter();
    const { orders, clearOrders, processRefund, processReturn, processExchange } = useOrderStore();
    const { products, fetchProducts, reduceStock, restoreStock } = useProductStore();
    const colorScheme = useColorScheme();
    const { hasPermission } = useAuthStore();
    
    useEffect(() => {
        fetchProducts();
    }, []);

    // Modal states
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isOptionsModalVisible, setOptionsModalVisible] = useState(false);
    
    // Action Modals
    const [isReturnModalVisible, setReturnModalVisible] = useState(false);
    const [isExchangeModalVisible, setExchangeModalVisible] = useState(false);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    
    // Inputs
    const [returnReason, setReturnReason] = useState('');
    const [exchangeReason, setExchangeReason] = useState('');

    // --- Exchange Multi-Item States ---
    const [exchangeList, setExchangeList] = useState<ExchangePair[]>([]);
    const [isAddingPair, setIsAddingPair] = useState(false);

    // Current pair being added
    const [currentReturnItem, setCurrentReturnItem] = useState<CartItem | null>(null);
    const [currentNewProduct, setCurrentNewProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [currentExchangeQty, setCurrentExchangeQty] = useState(1);

    // Filter products for exchange search
    const filteredProducts = products.filter(
        p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             (p.barcode && p.barcode.includes(searchQuery))
    );

    // Calculate Totals
    const totalReturnValue = exchangeList.reduce((sum, pair) => sum + (pair.returnItem.price * pair.quantity), 0);
    const totalNewValue = exchangeList.reduce((sum, pair) => sum + (pair.newProduct.price * pair.quantity), 0);
    const calculatedDiff = totalNewValue - totalReturnValue;

    // RBAC Permissions
    const canClearHistory = hasPermission(['Admin']); 
    const canProcessRefund = hasPermission(['Admin', 'Manager']); 
    const canProcessReturn = hasPermission(['Admin', 'Manager', 'Cashier']); 
    const canProcessExchange = hasPermission(['Admin', 'Manager', 'Cashier']); 

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
                        // Restore stock for all items in the order
                        const itemsToRestore = order.items.map(item => ({ id: item.id, quantity: item.quantity }));
                        restoreStock(itemsToRestore);

                        processRefund(order.id, {
                            refundDate: new Date().toISOString(),
                            refundedAmount: order.totalAmount,
                            reason: 'Customer requested full refund'
                        });
                        setOptionsModalVisible(false);
                        Alert.alert("Success", "Order fully refunded and inventory restored.");
                    }
                }
            ]
        );
    };

    const submitReturn = () => {
        if (selectedOrder) {
            // Restore stock for all items in the order
            const itemsToRestore = selectedOrder.items.map(item => ({ id: item.id, quantity: item.quantity }));
            restoreStock(itemsToRestore);

            processReturn(selectedOrder.id, returnReason || 'Customer returned items');
            setReturnModalVisible(false);
            setReturnReason('');
            Alert.alert("Success", "Order marked as returned and inventory restored.");
        }
    };

    const initiateExchange = () => {
        if (!selectedOrder) return;
        if (exchangeList.length === 0) {
            Alert.alert("Error", "Please add at least one product exchange pair.");
            return;
        }

        if (calculatedDiff > 0) {
            // Customer owes money, show payment modal
            setIsPaymentModalVisible(true);
        } else {
            // Shop owes customer or even exchange, finalize directly
            finalizeExchange();
        }
    };

    const finalizeExchange = (
        method?: PaymentMethod,
        details?: {
            splitDetails?: SplitPaymentDetails;
            cardDetails?: CardPaymentDetails;
            mfsDetails?: MFSPaymentDetails;
        }
    ) => {
        if (!selectedOrder) return;

        // 1. Restore stock for returned items
        const itemsToRestore = exchangeList.map(pair => ({ id: pair.returnItem.id, quantity: pair.quantity }));
        restoreStock(itemsToRestore);

        // 2. Reduce stock for newly given items
        const itemsToReduce = exchangeList.map(pair => ({ id: pair.newProduct.id, quantity: pair.quantity }));
        reduceStock(itemsToReduce);

        processExchange(selectedOrder.id, {
            exchangeDate: new Date().toISOString(),
            reason: exchangeReason || 'Customer exchanged items',
            exchangedItems: exchangeList.map(pair => ({
                oldProductId: pair.returnItem.id,
                newProductId: pair.newProduct.id,
                quantity: pair.quantity
            })), 
            priceDifference: calculatedDiff,
            paymentMethod: method,
            splitPaymentDetails: details?.splitDetails,
            cardDetails: details?.cardDetails,
            mfsDetails: details?.mfsDetails,
        });
        
        setIsPaymentModalVisible(false);
        setExchangeModalVisible(false);
        resetExchangeState();
        Alert.alert("Success", "Order marked as exchanged and inventory updated.");
    };

    const resetExchangeState = () => {
        setExchangeReason('');
        setExchangeList([]);
        setIsAddingPair(false);
        resetCurrentPairState();
    };

    const resetCurrentPairState = () => {
        setCurrentReturnItem(null);
        setCurrentNewProduct(null);
        setSearchQuery('');
        setShowProductDropdown(false);
        setCurrentExchangeQty(1);
    };

    const openOptionsModal = (order: Order) => {
        if(order.status === 'COMPLETED' || order.status === 'EXCHANGED') {
             setSelectedOrder(order);
             setOptionsModalVisible(true);
        } else {
             Alert.alert("Info", `This order is already ${order.status.toLowerCase()} and cannot be modified further.`);
        }
    };

    const getStatusTheme = (status: string) => {
        switch (status) {
            case 'COMPLETED': return { bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', icon: 'checkmark-circle' };
            case 'REFUNDED': return { bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20', text: 'text-rose-700 dark:text-rose-400', icon: 'arrow-undo' };
            case 'RETURNED': return { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', text: 'text-amber-700 dark:text-amber-400', icon: 'return-up-back' };
            case 'PARTIAL_RETURN': return { bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/20', text: 'text-orange-700 dark:text-orange-400', icon: 'pie-chart' };
            case 'EXCHANGED': return { bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-200 dark:border-violet-500/20', text: 'text-violet-700 dark:text-violet-400', icon: 'swap-horizontal' };
            default: return { bg: 'bg-slate-50 dark:bg-slate-500/10', border: 'border-slate-200 dark:border-slate-500/20', text: 'text-slate-700 dark:text-slate-400', icon: 'information-circle' };
        }
    };

    const getStatusIconColor = (status: string) => {
        const isDark = colorScheme === 'dark';
        switch (status) {
            case 'COMPLETED': return isDark ? '#34d399' : '#059669'; 
            case 'REFUNDED': return isDark ? '#f472b6' : '#be123c'; 
            case 'RETURNED': return isDark ? '#fbbf24' : '#d97706'; 
            case 'PARTIAL_RETURN': return isDark ? '#fb923c' : '#ea580c'; 
            case 'EXCHANGED': return isDark ? '#a78bfa' : '#7c3aed'; 
            default: return isDark ? '#94a3b8' : '#475569'; 
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
                            <Ionicons name={theme.icon as any} size={16} color={getStatusIconColor(item.status)} />
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

                        <View className="gap-2">
                            {item.paymentMethod === 'CARD' && item.cardDetails && (
                                <View className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-xl flex-row items-center border border-indigo-100 dark:border-indigo-500/20">
                                    <Ionicons name="card" size={16} color="#6366f1" className="mr-2" />
                                    <View className="ml-2 flex-1">
                                        <Text className="text-indigo-800 dark:text-indigo-300 text-xs font-bold mb-0.5">{item.cardDetails.cardType || 'Card'} ending in **{item.cardDetails.lastFourDigits || 'XXXX'}</Text>
                                        {item.cardDetails.transactionId && <Text className="text-indigo-600/70 dark:text-indigo-400/70 text-[10px] uppercase tracking-wider">TXN: {item.cardDetails.transactionId}</Text>}
                                    </View>
                                </View>
                            )}

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
                                        <Text className="text-violet-600/80 dark:text-violet-400/80 text-[11px] leading-4">
                                            {item.exchangeDetails.reason} 
                                            (Diff: {item.exchangeDetails.priceDifference > 0 ? '+' : ''}৳{item.exchangeDetails.priceDifference})
                                        </Text>
                                        {item.exchangeDetails.paymentMethod && (
                                            <View className="flex-row items-center mt-1">
                                                <Ionicons name={getPaymentIcon(item.exchangeDetails.paymentMethod)} size={10} color="#8b5cf6" className="mr-1" />
                                                <Text className="text-violet-600/80 dark:text-violet-400/80 text-[10px] font-bold">
                                                    Paid via {item.exchangeDetails.paymentMethod}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )}
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
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 shadow-sm">
                <View className="flex-row items-center gap-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center active:bg-slate-200 dark:active:bg-slate-700"
                    >
                        <Ionicons name="chevron-back" size={24} color={colorScheme === 'dark' ? '#cbd5e1' : '#334155'} />
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
                                        resetExchangeState();
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
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <View className="flex-1 justify-end bg-slate-900/60 backdrop-blur-sm">
                        <View className="bg-white dark:bg-slate-900 rounded-t-[32px] p-6 shadow-2xl border-t border-slate-200 dark:border-slate-800">
                             <View className="flex-row justify-between items-center mb-6">
                                <View>
                                    <Text className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Process Return</Text>
                                    <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Provide a reason for this return</Text>
                                </View>
                                <TouchableOpacity onPress={() => setReturnModalVisible(false)} className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center">
                                    <Ionicons name="close" size={20} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <View className="mb-6">
                                <Text className="text-slate-700 dark:text-slate-300 font-bold text-sm mb-2 ml-1">Return Reason</Text>
                                <TextInput
                                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-slate-800 dark:text-white text-base font-medium shadow-sm"
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
                                className="bg-amber-500 py-5 rounded-2xl items-center mt-4 shadow-lg shadow-amber-500/30 active:bg-amber-600 mb-8"
                            >
                                <Text className="text-white font-black text-lg tracking-wide">Confirm Return</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Exchange Modal (Professional Multi-Item Flow) */}
            <Modal
                visible={isExchangeModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setExchangeModalVisible(false)}
                onShow={() => {
                    if (exchangeList.length === 0) {
                        setIsAddingPair(true);
                    }
                }}
            >
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <View className="flex-1 justify-end bg-slate-900/60 backdrop-blur-sm">
                        <View className="bg-white dark:bg-slate-900 rounded-t-[32px] p-6 shadow-2xl h-[85%] border-t border-slate-200 dark:border-slate-800">
                            
                             <View className="flex-row justify-between items-center mb-4">
                                <View>
                                    <Text className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Product Exchange</Text>
                                </View>
                                <TouchableOpacity onPress={() => setExchangeModalVisible(false)} className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center">
                                    <Ionicons name="close" size={20} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            {exchangeList.length === 0 || isAddingPair ? (
                                // --- ADD PAIR VIEW ---
                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
                                    {exchangeList.length > 0 && (
                                        <TouchableOpacity onPress={() => setIsAddingPair(false)} className="mb-4 flex-row items-center bg-slate-100 dark:bg-slate-800 p-2 rounded-lg self-start">
                                            <Ionicons name="arrow-back" size={16} color="#6366f1" />
                                            <Text className="text-indigo-600 dark:text-indigo-400 font-bold ml-1 text-xs">Back to List</Text>
                                        </TouchableOpacity>
                                    )}
                                    
                                    <Text className="text-slate-700 dark:text-slate-300 font-bold text-sm mb-2 ml-1">1. Select item to return</Text>
                                    <View className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2 mb-6 border border-slate-200 dark:border-slate-700">
                                        {selectedOrder?.items.map((item) => (
                                            <TouchableOpacity 
                                                key={item.id}
                                                onPress={() => {
                                                    setCurrentReturnItem(item);
                                                    setCurrentExchangeQty(1); // Reset qty on change
                                                }}
                                                className={`p-3 rounded-xl flex-row justify-between items-center mb-1 border ${currentReturnItem?.id === item.id ? 'bg-amber-50 border-amber-300 dark:bg-amber-500/20 dark:border-amber-500/30' : 'border-transparent'}`}
                                            >
                                                <View className="flex-row items-center flex-1">
                                                    <Ionicons 
                                                        name={currentReturnItem?.id === item.id ? "radio-button-on" : "radio-button-off"} 
                                                        size={20} 
                                                        color={currentReturnItem?.id === item.id ? "#d97706" : "#94a3b8"} 
                                                    />
                                                    <Text className="ml-3 text-slate-800 dark:text-slate-200 font-medium flex-1" numberOfLines={1}>{item.name}</Text>
                                                </View>
                                                <Text className="text-slate-600 dark:text-slate-400 font-bold">৳{item.price}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <Text className="text-slate-700 dark:text-slate-300 font-bold text-sm mb-2 ml-1">2. Search new item to give</Text>
                                    <View className="mb-6 z-50">
                                        <View className="flex-row items-center bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 z-50">
                                            <Ionicons name="search" size={18} color="#94a3b8" />
                                            <TextInput 
                                                className="flex-1 p-3 text-slate-800 dark:text-white font-medium"
                                                placeholder="Search by name or barcode..."
                                                placeholderTextColor="#94a3b8"
                                                value={searchQuery}
                                                onChangeText={(text) => {
                                                    setSearchQuery(text);
                                                    setShowProductDropdown(text.length > 0);
                                                    if (text === '') setCurrentNewProduct(null);
                                                }}
                                                onFocus={() => {
                                                    if (searchQuery.length > 0) setShowProductDropdown(true);
                                                }}
                                            />
                                            {searchQuery.length > 0 && (
                                                <TouchableOpacity onPress={() => {
                                                    setSearchQuery('');
                                                    setCurrentNewProduct(null);
                                                    setShowProductDropdown(false);
                                                }}>
                                                    <Ionicons name="close-circle" size={18} color="#94a3b8" />
                                                </TouchableOpacity>
                                            )}
                                        </View>

                                        {showProductDropdown && filteredProducts.length > 0 && (
                                            <View className="absolute top-[100%] left-0 right-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl mt-1 shadow-lg max-h-40 z-50 overflow-hidden">
                                                <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                                                    {filteredProducts.map(p => (
                                                        <TouchableOpacity 
                                                            key={p.id} 
                                                            onPress={() => {
                                                                setCurrentNewProduct(p);
                                                                setSearchQuery(p.name);
                                                                setShowProductDropdown(false);
                                                            }}
                                                            className="p-3 border-b border-gray-100 dark:border-slate-700 flex-row justify-between items-center"
                                                        >
                                                            <View className="flex-1 pr-2">
                                                                <Text className="text-slate-800 dark:text-white font-bold" numberOfLines={1}>{p.name}</Text>
                                                                {p.barcode && <Text className="text-slate-500 text-xs text-[10px]">BC: {p.barcode}</Text>}
                                                            </View>
                                                            <Text className="text-blue-600 dark:text-blue-400 font-bold">৳{p.price}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            </View>
                                        )}
                                    </View>

                                    {currentReturnItem && currentNewProduct && (
                                        <View className="mb-6">
                                            <Text className="text-slate-700 dark:text-slate-300 font-bold text-sm mb-2 ml-1">3. Set Exchange Quantity</Text>
                                            <View className="flex-row items-center gap-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 self-start">
                                                <TouchableOpacity 
                                                    onPress={() => setCurrentExchangeQty(Math.max(1, currentExchangeQty - 1))}
                                                    className="h-10 w-10 bg-white dark:bg-slate-700 rounded-lg items-center justify-center shadow-sm border border-slate-100 dark:border-slate-600"
                                                >
                                                    <Ionicons name="remove" size={20} color="#64748b" />
                                                </TouchableOpacity>
                                                <Text className="font-bold text-xl w-8 text-center text-slate-800 dark:text-white">{currentExchangeQty}</Text>
                                                <TouchableOpacity 
                                                    onPress={() => setCurrentExchangeQty(Math.min(currentReturnItem.quantity, currentExchangeQty + 1))}
                                                    className="h-10 w-10 bg-white dark:bg-slate-700 rounded-lg items-center justify-center shadow-sm border border-slate-100 dark:border-slate-600"
                                                >
                                                    <Ionicons name="add" size={20} color="#64748b" />
                                                </TouchableOpacity>
                                            </View>
                                            {currentExchangeQty === currentReturnItem.quantity && (
                                                <Text className="text-xs text-slate-500 mt-2 ml-1">Maximum purchased quantity reached.</Text>
                                            )}
                                        </View>
                                    )}

                                    <TouchableOpacity 
                                        onPress={() => {
                                            setExchangeList([...exchangeList, {
                                                id: Date.now().toString(),
                                                returnItem: currentReturnItem!,
                                                newProduct: currentNewProduct!,
                                                quantity: currentExchangeQty
                                            }]);
                                            setIsAddingPair(false);
                                            resetCurrentPairState();
                                        }}
                                        disabled={!currentReturnItem || !currentNewProduct}
                                        className={`py-4 rounded-2xl items-center shadow-sm ${(!currentReturnItem || !currentNewProduct) ? 'bg-slate-300 dark:bg-slate-700' : 'bg-blue-600 shadow-blue-500/30 active:bg-blue-700'}`}
                                    >
                                        <Text className={`font-black text-lg tracking-wide ${(!currentReturnItem || !currentNewProduct) ? 'text-slate-500 dark:text-slate-400' : 'text-white'}`}>
                                            Add to Exchange List
                                        </Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            ) : (
                                // --- EXCHANGE LIST SUMMARY VIEW ---
                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
                                    <Text className="text-slate-700 dark:text-slate-300 font-bold text-sm mb-2 ml-1">Exchange List</Text>
                                    
                                    {exchangeList.map((pair) => (
                                        <View key={pair.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-3 border border-slate-200 dark:border-slate-700">
                                            <View className="flex-row justify-between items-start mb-2">
                                                <Text className="text-rose-600 dark:text-rose-400 font-bold text-xs">Return: {pair.returnItem.name} (x{pair.quantity})</Text>
                                                <TouchableOpacity onPress={() => setExchangeList(exchangeList.filter(p => p.id !== pair.id))}>
                                                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                                </TouchableOpacity>
                                            </View>
                                            <View className="flex-row items-center gap-2 mb-2 opacity-50">
                                                <Ionicons name="arrow-down" size={14} color="#64748b" />
                                            </View>
                                            <View className="flex-row justify-between items-start">
                                                <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">Give: {pair.newProduct.name} (x{pair.quantity})</Text>
                                                <Text className="text-slate-500 dark:text-slate-400 font-bold text-xs">
                                                    Diff: ৳{((pair.newProduct.price - pair.returnItem.price) * pair.quantity).toFixed(2)}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}

                                    <TouchableOpacity 
                                        onPress={() => setIsAddingPair(true)}
                                        className="py-3 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-500/50 items-center mb-6 bg-indigo-50 dark:bg-indigo-500/10"
                                    >
                                        <Text className="text-indigo-600 dark:text-indigo-400 font-bold">+ Add Another Product</Text>
                                    </TouchableOpacity>

                                    <View className="bg-violet-50 dark:bg-violet-900/20 rounded-2xl p-4 mb-6 border border-violet-100 dark:border-violet-500/30">
                                        <Text className="text-violet-800 dark:text-violet-300 font-bold mb-3 uppercase tracking-wider text-xs">Total Summary</Text>
                                        
                                        <View className="flex-row justify-between items-center mb-2">
                                            <Text className="text-slate-600 dark:text-slate-400">Total Taking Back:</Text>
                                            <Text className="text-rose-600 dark:text-rose-400 font-bold">- ৳{totalReturnValue}</Text>
                                        </View>
                                        <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-violet-200 dark:border-violet-500/30">
                                            <Text className="text-slate-600 dark:text-slate-400">Total Giving New:</Text>
                                            <Text className="text-emerald-600 dark:text-emerald-400 font-bold">+ ৳{totalNewValue}</Text>
                                        </View>
                                        
                                        <View className="flex-row justify-between items-center">
                                            <Text className="text-slate-800 dark:text-slate-200 font-black text-lg">
                                                {calculatedDiff > 0 ? 'Customer Pays' : calculatedDiff < 0 ? 'Shop Refunds' : 'Even Exchange'}
                                            </Text>
                                            <Text className={`font-black text-2xl ${calculatedDiff > 0 ? 'text-blue-600' : calculatedDiff < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                                                ৳{Math.abs(calculatedDiff)}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text className="text-slate-700 dark:text-slate-300 font-bold text-sm mb-2 ml-1">Reason for Exchange</Text>
                                    <TextInput
                                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-800 dark:text-white text-base mb-8 font-medium shadow-sm"
                                        placeholder="e.g. Size didn't fit, Multiple items..."
                                        placeholderTextColor="#94a3b8"
                                        value={exchangeReason}
                                        onChangeText={setExchangeReason}
                                    />

                                    <TouchableOpacity 
                                        onPress={initiateExchange}
                                        className="py-4 rounded-2xl items-center shadow-sm bg-violet-600 shadow-violet-500/30 active:bg-violet-700 mb-8"
                                    >
                                        <Text className="font-black text-lg tracking-wide text-white">
                                            {calculatedDiff > 0 ? `Pay ৳${calculatedDiff} & Confirm` : 'Confirm All Exchanges'}
                                        </Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            )}
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Payment Modal for Exchange */}
            <PaymentProcessingModal
                visible={isPaymentModalVisible}
                totalAmount={calculatedDiff > 0 ? calculatedDiff : 0}
                onClose={() => setIsPaymentModalVisible(false)}
                onConfirm={finalizeExchange}
            />
        </SafeAreaView>
    );
}