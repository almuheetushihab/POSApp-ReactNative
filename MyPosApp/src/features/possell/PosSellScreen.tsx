import {useTranslation} from "react-i18next";
import {useOrderStore} from "../../store/useOrderStore";
import {useCallback, useState} from "react";
import {useFocusEffect} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {Alert, FlatList, Image, Modal, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {ProductCard} from "../../components/ProductCard";
import {Ionicons} from "@expo/vector-icons";
import {OrderSuccessModal} from "../../components/OrderSuccessModal";
import {useProductStore} from "../../store/useProductStore";
import {useCartStore} from "../../store/useCartStore";
import {Order} from "../../types/order";
import {ScannerModal} from "../../components/ScannerModal";

export default function POSScreen() {
    const {t} = useTranslation();
    const {filteredProducts, fetchProducts, activeCategory, filterByCategory, products} = useProductStore();
    const {
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        getTotalPrice,
        getTotalItems,
        clearCart
    } = useCartStore();
    const {addOrder} = useOrderStore();

    const [isCartVisible, setIsCartVisible] = useState(false);
    const [isScannerVisible, setIsScannerVisible] = useState(false);

    // Receipt Modal States
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastOrder, setLastOrder] = useState<Order | null>(null);

    useFocusEffect(
        useCallback(() => {
            // Screen refresh logic if needed
        }, [])
    );

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

    // 🔥 Checkout Function
    const handleCheckout = () => {
        if (cart.length === 0) return;

        const newOrder: Order = {
            id: Date.now().toString(),
            items: cart,
            totalAmount: getTotalPrice(),
            date: new Date().toISOString(),
            paymentMethod: 'CASH',
        };

        addOrder(newOrder);
        setLastOrder(newOrder);

        setIsCartVisible(false);
        clearCart();

        setTimeout(() => {
            setShowSuccessModal(true);
        }, 300);
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
                    <ProductCard product={item} onPress={addToCart} quantity={getItemQuantity(item.id)}/>
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
                    <Text className="text-white text-2xl font-bold">৳ {getTotalPrice()}</Text>
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

                    <ScrollView className="flex-1 p-4">
                        {cart.map((rawItem) => {
                            const item = getCartItemDetails(rawItem);
                            return (
                                <View key={item.id}
                                      className="flex-row justify-between items-center bg-white dark:bg-slate-900 p-4 mb-3 rounded-xl shadow-sm">
                                    <View className="flex-row items-center gap-3 flex-1">
                                        <View
                                            className="h-12 w-12 bg-gray-100 dark:bg-slate-800 rounded-lg items-center justify-center overflow-hidden">
                                            {item.image ? <Image source={{uri: item.image}} className="h-full w-full"
                                                                 resizeMode="cover"/> :
                                                <Ionicons name="image-outline" size={24} color="#94a3b8"/>}
                                        </View>
                                        <View>
                                            <Text
                                                className="font-bold text-slate-800 dark:text-white text-lg">{item.name}</Text>
                                            <Text
                                                className="text-slate-500 dark:text-slate-400">৳{item.price} x {item.quantity}</Text>
                                        </View>
                                    </View>
                                    <View
                                        className="flex-row items-center gap-3 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                                        <TouchableOpacity onPress={() => decreaseQuantity(item.id)}
                                                          className="p-2 bg-white dark:bg-slate-700 rounded-md">
                                            <Ionicons name="remove" size={16}
                                                      color={item.quantity === 1 ? '#ef4444' : '#64748b'}/>
                                        </TouchableOpacity>
                                        <Text
                                            className="font-bold text-lg w-6 text-center text-slate-800 dark:text-white">{item.quantity}</Text>
                                        <TouchableOpacity onPress={() => increaseQuantity(item.id)}
                                                          className="p-2 bg-blue-600 rounded-md">
                                            <Ionicons name="add" size={16} color="white"/>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </ScrollView>

                    <View className="p-6 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
                        <View className="flex-row justify-between mb-4">
                            <Text className="text-slate-500 text-lg">Subtotal</Text>
                            <Text
                                className="text-slate-800 dark:text-white text-lg font-bold">৳ {getTotalPrice()}</Text>
                        </View>
                        <View className="flex-row gap-4">
                            <TouchableOpacity onPress={clearCart}
                                              className="flex-1 bg-red-100 p-4 rounded-xl items-center">
                                <Text className="text-red-600 font-bold text-lg">Clear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleCheckout}
                                              className="flex-2 bg-blue-600 p-4 rounded-xl items-center flex-grow active:bg-blue-700">
                                <Text className="text-white font-bold text-lg">Checkout (৳ {getTotalPrice()})</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Success Receipt Modal */}
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