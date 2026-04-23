import {useTranslation} from "react-i18next";
import {useOrderStore} from "../../store/useOrderStore";
import {useCallback, useState} from "react";
// import {useFocusEffect} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {Alert, FlatList, Image, Modal, ScrollView, Text, TouchableOpacity, View, TextInput} from "react-native";
import {ProductCard} from "../../components/ProductCard";
import {Ionicons} from "@expo/vector-icons";
import {OrderSuccessModal} from "../../components/OrderSuccessModal";
import {useProductStore} from "../../store/useProductStore";
import {useCartStore} from "../../store/useCartStore";
import {Order, PaymentMethod, SplitPaymentDetails, CardPaymentDetails, MFSPaymentDetails, DiscountDetails, CustomerDetails, TaxDetails} from "../../types/order";
import {ScannerModal} from "../../components/ScannerModal";
import {PaymentProcessingModal} from "../../components/PaymentProcessingModal";
import {useSettingsStore} from "../../store/useSettingsStore";

export default function POSScreen() {
    const {t} = useTranslation();
    const {
        filteredProducts,
        fetchProducts,
        activeCategory,
        filterByCategory,
        products,
        reduceStock
    } = useProductStore();
    const {
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        getTotalPrice,
        getTotalItems,
        clearCart
    } = useCartStore();
    const {addOrder} = useOrderStore();
    const {taxSettings} = useSettingsStore();

    const [isCartVisible, setIsCartVisible] = useState(false);
    const [isScannerVisible, setIsScannerVisible] = useState(false);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

    // Discount States
    const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
    const [discountValueStr, setDiscountValueStr] = useState('');
    
    // Customer States
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    // Receipt Modal States
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastOrder, setLastOrder] = useState<Order | null>(null);

    /* useFocusEffect(
        useCallback(() => {
            // Screen refresh logic if needed
        }, [])
    ); */

    const handleScan = (scannedCode: string) => {
        const product = products.find(p => p.barcode === scannedCode);

        if (product) {
            addToCart(product);
            Alert.alert("Success", `${product.name} added to cart!`);
        } else {
            Alert.alert("Not Found", "No product found with this barcode.");
        }
    };

    const CATEGORIES = ['All', 'Food', 'Drinks', 'Snacks'];

    const getItemQuantity = (productId: string) => {
        const item = cart.find(i => i.id === productId);
        return item ? item.quantity : 0;
    };

    const getCartItemDetails = (cartItem: any) => {
        const product = products.find(p => p.id === cartItem.id);
        return product ? {...cartItem, ...product} : cartItem;
    };

    // Calculate Subtotal, Discounts, and Tax
    const subTotal = getTotalPrice();
    let discountAmount = 0;
    const val = parseFloat(discountValueStr) || 0;
    
    if (val > 0) {
        if (discountType === 'FIXED') {
            discountAmount = val;
        } else {
            discountAmount = (subTotal * val) / 100;
        }
    }
    
    const totalAfterDiscount = Math.max(0, subTotal - discountAmount);

    let taxAmount = 0;
    if (taxSettings.isEnabled) {
        if (taxSettings.isInclusive) {
            // Formula for inclusive tax: Amount * (Rate / (100 + Rate))
            // This means the totalAfterDiscount ALREADY includes the tax. 
            // We just need to calculate how much of it was tax for reporting.
            taxAmount = totalAfterDiscount * (taxSettings.taxRate / (100 + taxSettings.taxRate));
        } else {
            // Formula for exclusive tax: Amount * (Rate / 100)
            // This adds tax ON TOP of the totalAfterDiscount.
            taxAmount = totalAfterDiscount * (taxSettings.taxRate / 100);
        }
    }

    // Final total calculation
    // If tax is inclusive, final total doesn't increase. 
    // If tax is exclusive, final total increases by tax amount.
    const finalTotal = taxSettings.isEnabled && !taxSettings.isInclusive 
        ? totalAfterDiscount + taxAmount 
        : totalAfterDiscount;

    const initiateCheckout = () => {
        if (cart.length === 0) return;
        setIsPaymentModalVisible(true);
    };

    const finalizeOrder = (
        method: PaymentMethod,
        details?: {
            splitDetails?: SplitPaymentDetails;
            cardDetails?: CardPaymentDetails;
            mfsDetails?: MFSPaymentDetails;
        }
    ) => {
        reduceStock(cart);
        
        const customer: CustomerDetails | undefined = (customerName || customerPhone) ? {
            name: customerName || 'Guest',
            phone: customerPhone
        } : undefined;

        const discount: DiscountDetails | undefined = val > 0 ? {
            type: discountType,
            value: val,
            amountCalculated: discountAmount
        } : undefined;

        const taxDetails: TaxDetails | undefined = taxSettings.isEnabled ? {
            taxName: taxSettings.taxName,
            taxRate: taxSettings.taxRate,
            taxAmount: taxAmount,
            isInclusive: taxSettings.isInclusive
        } : undefined;

        const newOrder: Order = {
            id: Date.now().toString(),
            items: cart,
            subTotal: subTotal,
            discount: discount,
            tax: taxDetails,
            totalAmount: finalTotal,
            date: new Date().toISOString(),
            customer: customer,
            paymentMethod: method,
            splitPaymentDetails: details?.splitDetails,
            cardDetails: details?.cardDetails,
            mfsDetails: details?.mfsDetails,
            status: 'COMPLETED'
        };

        addOrder(newOrder);
        setLastOrder(newOrder);

        // Reset cart states
        setIsPaymentModalVisible(false);
        setIsCartVisible(false);
        clearCart();
        setDiscountValueStr('');
        setCustomerName('');
        setCustomerPhone('');

        setTimeout(() => {
            setShowSuccessModal(true);
        }, 500);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">

            {/* Header Section */}
            <View className="bg-white dark:bg-slate-900 pb-4 pt-2 shadow-sm z-10">

                <View className="flex-row justify-between items-center px-4 mb-4">
                    <View style={{width: 40}}/>

                    <Text className="text-xl font-bold text-center text-slate-800 dark:text-white">New Sale</Text>

                    <TouchableOpacity
                        onPress={() => setIsScannerVisible(true)}
                        className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full"
                    >
                        <Ionicons name="scan" size={24} color="#2563eb"/>
                    </TouchableOpacity>
                </View>

                {/* Categories */}
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={CATEGORIES}
                    keyExtractor={(item) => item}
                    contentContainerStyle={{paddingHorizontal: 15}}
                    renderItem={({item}) => (
                        <TouchableOpacity
                            onPress={() => filterByCategory(item)}
                            className={`mr-2 px-4 py-2 rounded-full border ${activeCategory === item ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'}`}
                        >
                            <Text
                                className={activeCategory === item ? 'text-white' : 'text-slate-600 dark:text-slate-300'}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Product List */}
            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={{padding: 10, paddingBottom: 100}}
                renderItem={({item}) => (
                    <ProductCard
                        product={item}
                        onAdd={() => addToCart(item)}
                        onRemove={() => decreaseQuantity(item.id)}
                        quantity={getItemQuantity(item.id)
                        }/>
                )}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center mt-20">
                        <Ionicons name="cube-outline" size={50} color="#cbd5e1"/>
                        <Text className="text-slate-400 mt-2">No products available</Text>
                    </View>
                }
            />

            {/* Floating Bottom Cart Bar */}
            {cart.length > 0 && (
                <TouchableOpacity
                    onPress={() => setIsCartVisible(true)}
                    className="absolute bottom-4 left-4 right-4 bg-slate-900 dark:bg-blue-600 p-4 rounded-2xl flex-row justify-between items-center shadow-lg"
                >
                    <View className="flex-row items-center gap-3">
                        <View className="bg-orange-500 h-8 w-8 rounded-full items-center justify-center">
                            <Text className="text-white font-bold">{getTotalItems()}</Text>
                        </View>
                        <Text className="text-white text-lg font-medium">View Cart</Text>
                    </View>
                    <Text className="text-white text-2xl font-bold">৳ {subTotal}</Text>
                </TouchableOpacity>
            )}

            {/* Cart Modal */}
            <Modal visible={isCartVisible} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-gray-50 dark:bg-slate-950">
                    <View
                        className="flex-row justify-between items-center p-5 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
                        <Text className="text-2xl font-bold text-slate-800 dark:text-white">Current Order</Text>
                        <TouchableOpacity onPress={() => setIsCartVisible(false)}>
                            <Ionicons name="close-circle" size={30} color="#94a3b8"/>
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                        {/* Cart Items List */}
                        {cart.map((rawItem) => {
                            const item = getCartItemDetails(rawItem);
                            return (
                                <View key={item.id}
                                      className="flex-row justify-between items-center bg-white dark:bg-slate-900 p-4 mb-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 relative">
                                    <View className="flex-row items-center gap-3 flex-1">
                                        <View
                                            className="h-12 w-12 bg-gray-100 dark:bg-slate-800 rounded-lg items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-700">
                                            {item.image ? <Image source={{uri: item.image}} className="h-full w-full"
                                                                 resizeMode="cover"/> :
                                                <Ionicons name="image-outline" size={24} color="#94a3b8"/>}
                                        </View>
                                        <View className="flex-1">
                                            <Text
                                                className="font-bold text-slate-800 dark:text-white text-base pr-8" numberOfLines={1}>{item.name}</Text>
                                            <Text
                                                className="text-slate-500 dark:text-slate-400 font-medium">৳{item.price}</Text>
                                        </View>
                                    </View>
                                    
                                    <View className="flex-col items-end gap-2">
                                        <TouchableOpacity 
                                            onPress={() => removeFromCart(item.id)}
                                            className="absolute -top-2 -right-2 p-1 bg-red-100 dark:bg-red-900/30 rounded-full z-10"
                                        >
                                            <Ionicons name="trash-outline" size={16} color="#ef4444"/>
                                        </TouchableOpacity>
                                        <View
                                            className="flex-row items-center gap-3 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 border border-gray-200 dark:border-slate-700 mt-2">
                                            <TouchableOpacity onPress={() => decreaseQuantity(item.id)}
                                                              className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                                                <Ionicons name="remove" size={16}
                                                          color={item.quantity === 1 ? '#ef4444' : '#64748b'}/>
                                            </TouchableOpacity>
                                            <Text
                                                className="font-bold text-lg w-6 text-center text-slate-800 dark:text-white">{item.quantity}</Text>
                                            <TouchableOpacity onPress={() => increaseQuantity(item.id)}
                                                              className="p-2 bg-blue-600 rounded-lg shadow-sm">
                                                <Ionicons name="add" size={16} color="white"/>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}

                        {/* Customer Selection Section */}
                        <View className="mt-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                            <View className="flex-row items-center gap-2 mb-4">
                                <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
                                <Text className="text-lg font-bold text-slate-800 dark:text-white">Customer Details (Optional)</Text>
                            </View>
                            <View className="flex-row gap-3">
                                <View className="flex-1">
                                    <Text className="text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">Name</Text>
                                    <TextInput 
                                        className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white font-medium"
                                        placeholder="Walk-in Customer"
                                        placeholderTextColor="#94a3b8"
                                        value={customerName}
                                        onChangeText={setCustomerName}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">Phone</Text>
                                    <TextInput 
                                        className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white font-medium"
                                        placeholder="01XXXXXXXXX"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="phone-pad"
                                        value={customerPhone}
                                        onChangeText={setCustomerPhone}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Discount Section */}
                        <View className="mt-4 mb-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                            <View className="flex-row items-center gap-2 mb-4">
                                <Ionicons name="pricetag-outline" size={20} color="#f59e0b" />
                                <Text className="text-lg font-bold text-slate-800 dark:text-white">Apply Discount</Text>
                            </View>
                            
                            <View className="flex-row items-center gap-3">
                                <View className="flex-row bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                                    <TouchableOpacity 
                                        onPress={() => setDiscountType('FIXED')}
                                        className={`px-4 py-2 rounded-lg ${discountType === 'FIXED' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                                    >
                                        <Text className={`font-bold ${discountType === 'FIXED' ? 'text-blue-600 dark:text-white' : 'text-slate-500'}`}>৳ Fixed</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => setDiscountType('PERCENTAGE')}
                                        className={`px-4 py-2 rounded-lg ${discountType === 'PERCENTAGE' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                                    >
                                        <Text className={`font-bold ${discountType === 'PERCENTAGE' ? 'text-blue-600 dark:text-white' : 'text-slate-500'}`}>% Percent</Text>
                                    </TouchableOpacity>
                                </View>
                                
                                <TextInput 
                                    className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white font-bold text-right text-lg"
                                    placeholder="0"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="numeric"
                                    value={discountValueStr}
                                    onChangeText={setDiscountValueStr}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    {/* Bottom Summary & Actions */}
                    <View className="p-6 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-slate-500 font-medium">Subtotal</Text>
                            <Text className="text-slate-800 dark:text-white font-bold">৳ {subTotal}</Text>
                        </View>
                        
                        {discountAmount > 0 && (
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-rose-500 font-medium">Discount {discountType === 'PERCENTAGE' ? `(${val}%)` : ''}</Text>
                                <Text className="text-rose-600 font-bold">- ৳ {discountAmount.toFixed(2)}</Text>
                            </View>
                        )}
                        
                        {taxSettings.isEnabled && (
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-slate-500 font-medium">
                                    {taxSettings.taxName} ({taxSettings.taxRate}%) 
                                    <Text className="text-[10px]"> {taxSettings.isInclusive ? '(Inclusive)' : '(Exclusive)'}</Text>
                                </Text>
                                <Text className="text-slate-800 dark:text-white font-bold">
                                    {taxSettings.isInclusive ? 'Included' : `+ ৳ ${taxAmount.toFixed(2)}`}
                                </Text>
                            </View>
                        )}

                        <View className="flex-row justify-between mb-6 pt-3 border-t border-gray-100 dark:border-slate-800">
                            <Text className="text-slate-800 dark:text-white text-xl font-bold">Total</Text>
                            <Text className="text-blue-600 text-2xl font-extrabold">৳ {finalTotal.toFixed(2)}</Text>
                        </View>

                        <View className="flex-row gap-4">
                            <TouchableOpacity onPress={() => {
                                clearCart();
                                setDiscountValueStr('');
                                setCustomerName('');
                                setCustomerPhone('');
                                setIsCartVisible(false);
                            }}
                                className="flex-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 p-4 rounded-xl items-center">
                                <Text className="text-red-600 dark:text-red-400 font-bold text-lg">Clear All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={initiateCheckout}
                                              className="flex-[2] bg-blue-600 p-4 rounded-xl items-center shadow-md shadow-blue-500/30 active:bg-blue-700 flex-row justify-center gap-2">
                                <Text className="text-white font-bold text-lg">Pay ৳ {finalTotal.toFixed(0)}</Text>
                                <Ionicons name="arrow-forward" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <PaymentProcessingModal
                visible={isPaymentModalVisible}
                totalAmount={finalTotal}
                onClose={() => setIsPaymentModalVisible(false)}
                onConfirm={finalizeOrder}
            />

            <OrderSuccessModal
                visible={showSuccessModal}
                order={lastOrder}
                onClose={() => setShowSuccessModal(false)}
            />

            <ScannerModal
                visible={isScannerVisible}
                onClose={() => setIsScannerVisible(false)}
                onScan={handleScan}
            />
        </SafeAreaView>
    );
}