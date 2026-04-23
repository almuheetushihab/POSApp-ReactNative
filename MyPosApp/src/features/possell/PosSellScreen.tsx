import {useOrderStore} from "../../store/useOrderStore";
import React, {useState} from "react";
import { Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Alert, FlatList, Image, Modal, ScrollView, Text, View, TextInput, Switch} from "react-native";
import {ProductCard} from "../../components/ProductCard";
import {Ionicons} from "@expo/vector-icons";
import {OrderSuccessModal} from "../../components/OrderSuccessModal";
import {useProductStore} from "../../store/useProductStore";
import {useCartStore} from "../../store/useCartStore";
import {Order, PaymentMethod, SplitPaymentDetails, CardPaymentDetails, MFSPaymentDetails, DiscountDetails, CustomerDetails, TaxDetails} from "../../types/order";
import {ScannerModal} from "../../components/ScannerModal";
import {PaymentProcessingModal} from "../../components/PaymentProcessingModal";
import {useSettingsStore} from "../../store/useSettingsStore";
import {useCustomerStore} from "../../store/useCustomerStore";

const POSScreen = () => {
    const {
        filteredProducts,
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
    
    // We must ignore typescript here because we recently added loyaltySettings to useSettingsStore 
    // but the IDE might not have picked up the updated type definitions everywhere immediately.
    // @ts-ignore
    const taxSettings = useSettingsStore(state => state.taxSettings);
    // @ts-ignore
    const loyaltySettings = useSettingsStore(state => state.loyaltySettings);
    
    const {customers, addCustomer, addPointsToCustomer, deductPointsFromCustomer} = useCustomerStore();

    const [isCartVisible, setIsCartVisible] = useState(false);
    const [isScannerVisible, setIsScannerVisible] = useState(false);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

    // Discount States
    const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
    const [discountValueStr, setDiscountValueStr] = useState('');
    
    // Customer States
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Loyalty States
    const [usePoints, setUsePoints] = useState(false);
    const [pointsToUseStr, setPointsToUseStr] = useState('');

    // Receipt Modal States
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastOrder, setLastOrder] = useState<Order | null>(null);

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
    
    // Calculate Loyalty Discount
    let loyaltyDiscountAmount = 0;
    const pointsToUse = parseInt(pointsToUseStr) || 0;
    const currentCustomer = customers.find(c => c.id === selectedCustomerId);
    
    if (usePoints && currentCustomer && loyaltySettings?.isEnabled) {
        if (pointsToUse > 0 && pointsToUse <= (currentCustomer.loyaltyPoints || 0)) {
            loyaltyDiscountAmount = pointsToUse * loyaltySettings.takaPerPoint;
            // Cap loyalty discount to subtotal - regular discount
            if (loyaltyDiscountAmount > (subTotal - discountAmount)) {
                loyaltyDiscountAmount = subTotal - discountAmount;
            }
        }
    }

    const totalDiscount = discountAmount + loyaltyDiscountAmount;
    const totalAfterDiscount = Math.max(0, subTotal - totalDiscount);

    let taxAmount = 0;
    if (taxSettings?.isEnabled) {
        if (taxSettings.isInclusive) {
            taxAmount = totalAfterDiscount * (taxSettings.taxRate / (100 + taxSettings.taxRate));
        } else {
            taxAmount = totalAfterDiscount * (taxSettings.taxRate / 100);
        }
    }

    // Final total calculation
    const finalTotal = taxSettings?.isEnabled && !taxSettings.isInclusive 
        ? totalAfterDiscount + taxAmount 
        : totalAfterDiscount;

    const isCheckoutEnabled = () => {
        if (cart.length === 0) return false;
        // Make customer required (either select from list or enter new name & phone)
        if (!customerName.trim() || !customerPhone.trim()) return false;
        
        // Validation for points
        if (usePoints && pointsToUse > 0) {
            if (!currentCustomer) return false;
            if (pointsToUse > (currentCustomer.loyaltyPoints || 0)) return false;
        }
        return true;
    };

    const initiateCheckout = () => {
        if (!isCheckoutEnabled()) {
            Alert.alert("Missing Info", "Please ensure customer details are provided and points entered are valid.");
            return;
        }
        setIsPaymentModalVisible(true);
    };

    const handleSelectCustomer = (customer: CustomerDetails) => {
        setCustomerName(customer.name);
        setCustomerPhone(customer.phone);
        setSelectedCustomerId(customer.id || null);
        setSearchQuery(customer.phone);
        setShowCustomerDropdown(false);
        setUsePoints(false);
        setPointsToUseStr('');
    };

    const handlePhoneChange = (text: string) => {
        setSearchQuery(text);
        setCustomerPhone(text);
        setShowCustomerDropdown(text.length > 0);
        
        // If user manually types and it no longer matches the selected customer, clear selected customer
        if (selectedCustomerId) {
            const c = customers.find(x => x.id === selectedCustomerId);
            if (c && c.phone !== text) {
                setSelectedCustomerId(null);
                setUsePoints(false);
                setPointsToUseStr('');
            }
        }
    };

    const filteredCustomers = customers.filter(
        c => c.phone.includes(searchQuery) || c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const finalizeOrder = (
        method: PaymentMethod,
        details?: {
            splitDetails?: SplitPaymentDetails;
            cardDetails?: CardPaymentDetails;
            mfsDetails?: MFSPaymentDetails;
        }
    ) => {
        reduceStock(cart);
        
        let customerId = selectedCustomerId;
        
        // Ensure customer is saved to store if it's new
        if (!customerId) {
            const existingCustomer = customers.find(c => c.phone === customerPhone);
            if (!existingCustomer) {
                const newCus = addCustomer({
                    name: customerName,
                    phone: customerPhone
                });
                customerId = newCus.id || null;
            } else {
                customerId = existingCustomer.id || null;
            }
        }

        const customer: CustomerDetails = customers.find(c => c.id === customerId) || {
            name: customerName,
            phone: customerPhone
        };

        // Calculate Points Earned & Deduct Used Points (Must be done before generating reason)
        let pointsEarned = 0;
        let actualPointsUsed = 0;
        
        if (loyaltySettings?.isEnabled && customerId) {
            pointsEarned = Math.floor(finalTotal * loyaltySettings.pointsPerTaka);
            addPointsToCustomer(customerId, pointsEarned, finalTotal);
        }

        if (usePoints && loyaltySettings?.isEnabled && customerId) {
            const pts = parseInt(pointsToUseStr) || 0;
            if (pts > 0) {
                actualPointsUsed = pts;
                deductPointsFromCustomer(customerId, pts);
            }
        }

        const discount: DiscountDetails | undefined = (discountAmount > 0 || loyaltyDiscountAmount > 0) ? {
            type: discountType,
            value: discountAmount > 0 ? val : 0,
            amountCalculated: totalDiscount,
            reason: [
                discountAmount > 0 ? `Manual ${discountType}` : '',
                loyaltyDiscountAmount > 0 ? `Points: ${actualPointsUsed}` : ''
            ].filter(Boolean).join(' + ')
        } : undefined;

        const taxDetails: TaxDetails | undefined = taxSettings?.isEnabled ? {
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
            pointsEarned: pointsEarned,
            pointsUsed: actualPointsUsed,
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
        setSearchQuery('');
        setSelectedCustomerId(null);
        setUsePoints(false);
        setPointsToUseStr('');

        setTimeout(() => {
            setShowSuccessModal(true);
        }, 500);
    };

    const clearCartModal = () => {
        clearCart();
        setDiscountValueStr('');
        setCustomerName('');
        setCustomerPhone('');
        setSearchQuery('');
        setSelectedCustomerId(null);
        setUsePoints(false);
        setPointsToUseStr('');
        setIsCartVisible(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">

            {/* Header Section */}
            <View className="bg-white dark:bg-slate-900 pb-4 pt-2 shadow-sm z-10">

                <View className="flex-row justify-between items-center px-4 mb-4">
                    <View style={{width: 40}}/>

                    <Text className="text-xl font-bold text-center text-slate-800 dark:text-white">New Sale</Text>

                    <Pressable
                        onPress={() => setIsScannerVisible(true)}
                        className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full"
                    >
                        <Ionicons name="scan" size={24} color="#2563eb"/>
                    </Pressable>
                </View>

                {/* Categories */}
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={CATEGORIES}
                    keyExtractor={(item) => item}
                    contentContainerStyle={{paddingHorizontal: 15}}
                    renderItem={({item}) => (
                        <Pressable
                            onPress={() => filterByCategory(item)}
                            className={`mr-2 px-4 py-2 rounded-full border ${activeCategory === item ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'}`}
                        >
                            <Text
                                className={activeCategory === item ? 'text-white' : 'text-slate-600 dark:text-slate-300'}>{item}</Text>
                        </Pressable>
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
                <Pressable
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
                </Pressable>
            )}

            {/* Cart Modal */}
            <Modal visible={isCartVisible} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-gray-50 dark:bg-slate-950">
                    <View
                        className="flex-row justify-between items-center p-5 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 z-50">
                        <Text className="text-2xl font-bold text-slate-800 dark:text-white">Current Order</Text>
                        <Pressable onPress={() => setIsCartVisible(false)}>
                            <Ionicons name="close-circle" size={30} color="#94a3b8"/>
                        </Pressable>
                    </View>

                    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        {/* Cart Items List */}
                        {cart.map((rawItem) => {
                            const item = getCartItemDetails(rawItem);
                            return (
                                <View key={item.id}
                                      className="flex-row justify-between items-center bg-white dark:bg-slate-900 p-4 mb-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 relative z-10">
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
                                        <Pressable
                                            onPress={() => removeFromCart(item.id)}
                                            className="absolute -top-2 -right-2 p-1 bg-red-100 dark:bg-red-900/30 rounded-full z-10"
                                        >
                                            <Ionicons name="trash-outline" size={16} color="#ef4444"/>
                                        </Pressable>
                                        <View
                                            className="flex-row items-center gap-3 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 border border-gray-200 dark:border-slate-700 mt-2">
                                            <Pressable onPress={() => decreaseQuantity(item.id)}
                                                              className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                                                <Ionicons name="remove" size={16}
                                                          color={item.quantity === 1 ? '#ef4444' : '#64748b'}/>
                                            </Pressable>
                                            <Text
                                                className="font-bold text-lg w-6 text-center text-slate-800 dark:text-white">{item.quantity}</Text>
                                            <Pressable onPress={() => increaseQuantity(item.id)}
                                                              className="p-2 bg-blue-600 rounded-lg shadow-sm">
                                                <Ionicons name="add" size={16} color="white"/>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}

                        {/* Customer & Loyalty Section */}
                        <View className="mt-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm z-50">
                            <View className="flex-row items-center justify-between mb-4 z-50">
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
                                    <Text className="text-lg font-bold text-slate-800 dark:text-white">Customer & Loyalty</Text>
                                </View>
                                <Text className="text-rose-500 text-xs font-bold bg-rose-50 px-2 py-1 rounded-md">Required *</Text>
                            </View>

                            {/* Customer Search/Phone Field */}
                            <View className="mb-3 z-50 relative">
                                <Text className="text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">Search Phone Number</Text>
                                <View className="flex-row items-center bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 z-50">
                                    <Ionicons name="search" size={18} color="#94a3b8" />
                                    <TextInput 
                                        className="flex-1 p-3 text-slate-800 dark:text-white font-medium"
                                        placeholder="Enter Phone Number..."
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="phone-pad"
                                        value={searchQuery}
                                        onChangeText={handlePhoneChange}
                                        onFocus={() => {
                                            if (searchQuery.length > 0) setShowCustomerDropdown(true);
                                        }}
                                    />
                                    {searchQuery.length > 0 && (
                                        <Pressable onPress={() => {
                                            setSearchQuery('');
                                            setCustomerPhone('');
                                            setCustomerName('');
                                            setSelectedCustomerId(null);
                                            setUsePoints(false);
                                            setPointsToUseStr('');
                                            setShowCustomerDropdown(false);
                                        }}>
                                            <Ionicons name="close-circle" size={18} color="#94a3b8" />
                                        </Pressable>
                                    )}
                                </View>

                                {/* Dropdown List */}
                                {showCustomerDropdown && filteredCustomers.length > 0 && (
                                    <View className="absolute top-[100%] left-0 right-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl mt-1 shadow-lg max-h-40 z-50 overflow-hidden">
                                        <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                                            {filteredCustomers.map(c => (
                                                <Pressable
                                                    key={c.id} 
                                                    onPress={() => handleSelectCustomer(c)}
                                                    className="p-3 border-b border-gray-100 dark:border-slate-700 flex-row justify-between items-center"
                                                >
                                                    <View>
                                                        <Text className="text-slate-800 dark:text-white font-bold">{c.phone}</Text>
                                                        <Text className="text-slate-500 text-xs">{c.name}</Text>
                                                    </View>
                                                    <View className="bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-md">
                                                        <Text className="text-amber-600 dark:text-amber-400 text-xs font-bold">{c.loyaltyPoints || 0} pts</Text>
                                                    </View>
                                                </Pressable>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>

                            <View className="mb-4 z-10">
                                <Text className="text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">Name <Text className="text-red-500">*</Text></Text>
                                <TextInput 
                                    className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white font-medium"
                                    placeholder="Full Name"
                                    placeholderTextColor="#94a3b8"
                                    value={customerName}
                                    onChangeText={setCustomerName}
                                />
                            </View>

                            {/* Loyalty Points Section */}
                            {loyaltySettings?.isEnabled && currentCustomer && (currentCustomer.loyaltyPoints || 0) >= loyaltySettings.minimumPointsToRedeem && (
                                <View className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-200 dark:border-amber-900/30 z-10">
                                    <View className="flex-row justify-between items-center mb-2">
                                        <View>
                                            <Text className="font-bold text-amber-800 dark:text-amber-400 flex-row items-center">
                                                <Ionicons name="star" size={14} color="#d97706" /> Loyalty Reward
                                            </Text>
                                            <Text className="text-amber-600 dark:text-amber-500 text-xs mt-0.5">Available: {currentCustomer.loyaltyPoints} points</Text>
                                        </View>
                                        <Switch
                                            value={usePoints}
                                            onValueChange={setUsePoints}
                                            trackColor={{ false: '#cbd5e1', true: '#f59e0b' }}
                                            thumbColor={'#ffffff'}
                                        />
                                    </View>
                                    
                                    {usePoints && (
                                        <View className="mt-2 flex-row items-center gap-3">
                                            <TextInput
                                                className="flex-1 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700 rounded-lg p-2 text-slate-800 dark:text-white font-bold text-center"
                                                placeholder="0"
                                                keyboardType="numeric"
                                                value={pointsToUseStr}
                                                onChangeText={setPointsToUseStr}
                                            />
                                            <Text className="text-amber-700 dark:text-amber-300 font-bold text-sm">
                                                = ৳{((parseInt(pointsToUseStr) || 0) * loyaltySettings.takaPerPoint).toFixed(2)} off
                                            </Text>
                                        </View>
                                    )}
                                    {usePoints && (parseInt(pointsToUseStr) || 0) > (currentCustomer.loyaltyPoints || 0) && (
                                        <Text className="text-red-500 text-xs mt-1">Cannot use more points than available.</Text>
                                    )}
                                </View>
                            )}

                            {loyaltySettings?.isEnabled && (!currentCustomer || (currentCustomer.loyaltyPoints || 0) < loyaltySettings.minimumPointsToRedeem) && (
                                <View className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 z-10 flex-row items-center gap-2">
                                    <Ionicons name="star-outline" size={16} color="#94a3b8" />
                                    <Text className="text-slate-500 text-xs flex-1">
                                        {currentCustomer 
                                            ? `${currentCustomer.loyaltyPoints || 0} pts available. Need ${loyaltySettings.minimumPointsToRedeem} pts to redeem.` 
                                            : `Earn points on this purchase!`}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Discount Section */}
                        <View className="mt-4 mb-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm z-10">
                            <View className="flex-row items-center gap-2 mb-4">
                                <Ionicons name="pricetag-outline" size={20} color="#f59e0b" />
                                <Text className="text-lg font-bold text-slate-800 dark:text-white">Apply Manual Discount</Text>
                            </View>
                            
                            <View className="flex-row items-center gap-3">
                                <View className="flex-row bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                                    <Pressable
                                        onPress={() => setDiscountType('FIXED')}
                                        className={`px-4 py-2 rounded-lg ${discountType === 'FIXED' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                                    >
                                        <Text className={`font-bold ${discountType === 'FIXED' ? 'text-blue-600 dark:text-white' : 'text-slate-500'}`}>৳ Fixed</Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={() => setDiscountType('PERCENTAGE')}
                                        className={`px-4 py-2 rounded-lg ${discountType === 'PERCENTAGE' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                                    >
                                        <Text className={`font-bold ${discountType === 'PERCENTAGE' ? 'text-blue-600 dark:text-white' : 'text-slate-500'}`}>% Percent</Text>
                                    </Pressable>
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
                    <View className="p-6 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 z-10">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-slate-500 font-medium">Subtotal</Text>
                            <Text className="text-slate-800 dark:text-white font-bold">৳ {subTotal}</Text>
                        </View>
                        
                        {discountAmount > 0 && (
                            <View className="flex-row justify-between mb-1">
                                <Text className="text-rose-500 font-medium">Manual Discount {discountType === 'PERCENTAGE' ? `(${val}%)` : ''}</Text>
                                <Text className="text-rose-600 font-bold">- ৳ {discountAmount.toFixed(2)}</Text>
                            </View>
                        )}

                        {loyaltyDiscountAmount > 0 && (
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-amber-500 font-medium">Points Used ({pointsToUse} pts)</Text>
                                <Text className="text-amber-600 font-bold">- ৳ {loyaltyDiscountAmount.toFixed(2)}</Text>
                            </View>
                        )}
                        
                        {taxSettings?.isEnabled && (
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

                        <View className="flex-row justify-between mb-4 pt-3 border-t border-gray-100 dark:border-slate-800">
                            <Text className="text-slate-800 dark:text-white text-xl font-bold">Total</Text>
                            <Text className="text-blue-600 text-2xl font-extrabold">৳ {finalTotal.toFixed(2)}</Text>
                        </View>
                        
                        {loyaltySettings?.isEnabled && isCheckoutEnabled() && (
                            <View className="mb-4 bg-emerald-50 dark:bg-emerald-900/20 py-2 px-3 rounded-lg flex-row justify-center items-center gap-2 border border-emerald-100 dark:border-emerald-900/30">
                                <Ionicons name="gift" size={14} color="#10b981" />
                                <Text className="text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                                    Customer will earn <Text className="font-black">{Math.floor(finalTotal * loyaltySettings.pointsPerTaka)}</Text> points
                                </Text>
                            </View>
                        )}

                        <View className="flex-row gap-4">
                            <Pressable onPress={clearCartModal}
                                className="flex-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 p-4 rounded-xl items-center">
                                <Text className="text-red-600 dark:text-red-400 font-bold text-lg">Clear All</Text>
                            </Pressable>
                            <Pressable onPress={initiateCheckout}
                                              className={`flex-[2] p-4 rounded-xl items-center shadow-md flex-row justify-center gap-2 ${isCheckoutEnabled() ? 'bg-blue-600 shadow-blue-500/30 active:bg-blue-700' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                <Text className={`${isCheckoutEnabled() ? 'text-white' : 'text-slate-500'} font-bold text-lg`}>Pay ৳ {finalTotal.toFixed(0)}</Text>
                                <Ionicons name="arrow-forward" size={20} color={isCheckoutEnabled() ? "white" : "#64748b"} />
                            </Pressable>
                        </View>
                        {!isCheckoutEnabled() && (
                            <Text className="text-rose-500 text-xs text-center mt-2 font-medium">Please provide valid customer details & points to checkout</Text>
                        )}
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

export default React.memo(POSScreen);