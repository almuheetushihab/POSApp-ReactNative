import React, {useState, useCallback} from 'react';
import {View, Text, FlatList, TouchableOpacity, Modal, ScrollView, Image} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from 'expo-router';
import {ProductCard} from "../../components/ProductCard";
import {useProductStore} from "../../store/useProductStore";
import {useCartStore} from "../../store/useCartStore";

export default function POSScreen() {
    const {t} = useTranslation();

    // Store থেকে ডাটা নেওয়া
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

    const [isCartVisible, setIsCartVisible] = useState(false);

    // 🔥 যখনি এই স্ক্রিনে আসবে, ডাটা রিফ্রেশ করবে (যাতে আপডেটেড নাম/দাম পাওয়া যায়)
    useFocusEffect(
        useCallback(() => {
            // ফিল্টার বা ক্যাটাগরি ঠিক রাখার জন্য রি-ফেচ করার দরকার নেই কারণ Zustand গ্লোবাল স্টেট
            // তবে যদি নিশ্চিত হতে চান যে লেটেস্ট ডাটা আছে, তাহলে এখানে লজিক বসানো যায়
            // আমাদের বর্তমান সেটআপে Zustand অটোমেটিক আপডেট করবে।
        }, [])
    );

    const CATEGORIES = ['All', 'Food', 'Drinks', 'Snacks'];

    const getItemQuantity = (productId: string) => {
        const item = cart.find(i => i.id === productId);
        return item ? item.quantity : 0;
    };

    // কার্ট আইটেমের লেটেস্ট ডাটা বের করার হেল্পার ফাংশন
    // (যাতে প্রোডাক্টের নাম/ছবি পাল্টালে কার্টেও পাল্টায়)
    const getCartItemDetails = (cartItem: any) => {
        const product = products.find(p => p.id === cartItem.id);
        return product ? {...cartItem, ...product} : cartItem;
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">

            {/* 1. Header & Categories */}
            <View className="bg-white dark:bg-slate-900 pb-4 pt-2 shadow-sm z-10">
                <Text className="text-xl font-bold text-center mb-4 text-slate-800 dark:text-white">
                    New Sale
                </Text>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={CATEGORIES}
                    keyExtractor={(item) => item}
                    contentContainerStyle={{paddingHorizontal: 15}}
                    renderItem={({item}) => (
                        <TouchableOpacity
                            onPress={() => filterByCategory(item)}
                            className={`mr-2 px-4 py-2 rounded-full border ${
                                activeCategory === item
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                            }`}
                        >
                            <Text
                                className={activeCategory === item ? 'text-white' : 'text-slate-600 dark:text-slate-300'}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* 2. Product Grid */}
            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={{padding: 10, paddingBottom: 100}}
                renderItem={({item}) => (
                    <ProductCard
                        product={item}
                        onPress={addToCart}
                        quantity={getItemQuantity(item.id)}
                    />
                )}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center mt-20">
                        <Ionicons name="cube-outline" size={50} color="#cbd5e1"/>
                        <Text className="text-slate-400 mt-2">No products available</Text>
                    </View>
                }
            />

            {/* 3. Floating Bottom Cart Bar */}
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

            {/* 4. Cart Modal (Details View) */}
            <Modal visible={isCartVisible} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-gray-50 dark:bg-slate-950">
                    {/* Modal Header */}
                    <View
                        className="flex-row justify-between items-center p-5 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
                        <Text className="text-2xl font-bold text-slate-800 dark:text-white">Current Order</Text>
                        <TouchableOpacity onPress={() => setIsCartVisible(false)}>
                            <Ionicons name="close-circle" size={30} color="#94a3b8"/>
                        </TouchableOpacity>
                    </View>

                    {/* Cart Items List */}
                    <ScrollView className="flex-1 p-4">
                        {cart.map((rawItem) => {
                            // কার্টে থাকা আইটেমের সাথে মেইন স্টোরের লেটেস্ট ডাটা মার্জ করা হচ্ছে
                            const item = getCartItemDetails(rawItem);

                            return (
                                <View key={item.id}
                                      className="flex-row justify-between items-center bg-white dark:bg-slate-900 p-4 mb-3 rounded-xl shadow-sm">
                                    <View className="flex-row items-center gap-3 flex-1">
                                        <View
                                            className="h-12 w-12 bg-gray-100 dark:bg-slate-800 rounded-lg items-center justify-center overflow-hidden">
                                            {item.image ? (
                                                <Image source={{uri: item.image}} className="h-full w-full"
                                                       resizeMode="cover"/>
                                            ) : (
                                                <Ionicons name="image-outline" size={24} color="#94a3b8"/>
                                            )}
                                        </View>
                                        <View>
                                            <Text
                                                className="font-bold text-slate-800 dark:text-white text-lg">{item.name}</Text>
                                            <Text
                                                className="text-slate-500 dark:text-slate-400">৳{item.price} x {item.quantity}</Text>
                                        </View>
                                    </View>

                                    {/* Quantity Controls */}
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

                    {/* Checkout Footer */}
                    <View className="p-6 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
                        <View className="flex-row justify-between mb-4">
                            <Text className="text-slate-500 text-lg">Subtotal</Text>
                            <Text
                                className="text-slate-800 dark:text-white text-lg font-bold">৳ {getTotalPrice()}</Text>
                        </View>
                        <View className="flex-row justify-between mb-6">
                            <Text className="text-slate-500 text-lg">VAT (0%)</Text>
                            <Text className="text-slate-800 dark:text-white text-lg font-bold">৳ 0</Text>
                        </View>

                        <View className="flex-row gap-4">
                            <TouchableOpacity onPress={clearCart}
                                              className="flex-1 bg-red-100 p-4 rounded-xl items-center">
                                <Text className="text-red-600 font-bold text-lg">Clear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-2 bg-blue-600 p-4 rounded-xl items-center flex-grow">
                                <Text className="text-white font-bold text-lg">Checkout (৳ {getTotalPrice()})</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}