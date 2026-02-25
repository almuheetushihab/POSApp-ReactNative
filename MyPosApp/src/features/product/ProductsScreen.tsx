import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    ScrollView,
    Image
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useTranslation} from 'react-i18next';
import {useRouter} from "expo-router";

import {ProductCard} from "../../components/ProductCard";
import {useProductStore} from "../../store/useProductStore";
import {useCartStore} from "../../store/useCartStore";
import {Product} from "../../types/product";
import {AddProductModal} from "../../components/AddProductModal";

const CATEGORIES = ['All', 'Food', 'Drinks', 'Snacks'];

export default function ProductsScreen() {
    const router = useRouter();
    const {t} = useTranslation();
    const [isCartVisible, setIsCartVisible] = useState(false);

    const {
        filteredProducts,
        isLoading,
        fetchProducts,
        searchProducts,
        filterByCategory,
        activeCategory,
        products
    } = useProductStore();

    const {
        cart,
        addToCart,
        decreaseQuantity,
        increaseQuantity,
        getTotalPrice,
        getTotalItems,
        clearCart
    } = useCartStore();

    useEffect(() => {
        fetchProducts();
    }, []);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const getItemQuantity = (productId: string) => {
        const item = cart.find(i => i.id === productId);
        return item ? item.quantity : 0;
    };

    const getCartItemDetails = (cartItem: any) => {
        const product = products.find(p => p.id === cartItem.id);
        return product ? {...cartItem, ...product} : cartItem;
    };

    const handleProductPress = (item: Product) => {
        router.push({
            pathname: '/productdetails',
            params: {
                id: item.id,
                name: item.name,
                price: item.price.toString(),
                stock: item.stock.toString(),
                image: item.image,
                category: item.category
            }
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            <View className="p-5 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
                <Text className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                    {t('products_title')} ({filteredProducts.length})
                </Text>

                <View
                    className="flex-row items-center bg-gray-100 dark:bg-slate-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700">
                    <Ionicons name="search" size={20} color="#94a3b8"/>
                    <TextInput
                        className="flex-1 ml-3 text-slate-800 dark:text-white font-medium"
                        placeholder={t('search_placeholder')}
                        placeholderTextColor="#94a3b8"
                        onChangeText={searchProducts}
                    />
                </View>
            </View>

            {/* Categories */}
            <View className="py-4">
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={CATEGORIES}
                    keyExtractor={(item) => item}
                    contentContainerStyle={{paddingHorizontal: 20}}
                    renderItem={({item}) => (
                        <TouchableOpacity
                            onPress={() => filterByCategory(item)}
                            className={`mr-3 px-5 py-2 rounded-full border ${
                                activeCategory === item
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700'
                            }`}
                        >
                            <Text className={`font-semibold ${
                                activeCategory === item ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                            }`}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Product List */}
            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563eb"/>
                    <Text className="text-slate-400 mt-2">Loading Items...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={{padding: 10, paddingBottom: 100}}
                    renderItem={({item}) => (
                        <ProductCard
                            product={item}
                            onPress={() => handleProductPress(item)}
                            quantity={getItemQuantity(item.id)}
                            onAdd={() => addToCart(item)}
                            onRemove={() => decreaseQuantity(item.id)}
                        />
                    )}
                    ListEmptyComponent={
                        <View className="items-center mt-20">
                            <Ionicons name="cube-outline" size={50} color="#cbd5e1"/>
                            <Text className="text-slate-400 mt-4">No products found</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                onPress={() => setIsAddModalVisible(true)}
                className="absolute bottom-6 right-6 bg-blue-600 h-14 w-14 rounded-full items-center justify-center shadow-lg shadow-blue-400 z-50"
            >
                <Ionicons name="add" size={30} color="white"/>
            </TouchableOpacity>

            <AddProductModal
                visible={isAddModalVisible}
                onClose={() => setIsAddModalVisible(false)}
            />

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

            <Modal visible={isCartVisible} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-gray-50 dark:bg-slate-950">
                    <View
                        className="flex-row justify-between items-center p-5 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
                        <Text className="text-2xl font-bold text-slate-800 dark:text-white">Current Cart</Text>
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
                            <TouchableOpacity onPress={() => {
                                setIsCartVisible(false);
                                router.push('/pos');
                            }} className="flex-2 bg-blue-600 p-4 rounded-xl items-center flex-grow active:bg-blue-700">
                                <Text className="text-white font-bold text-lg">Go to Checkout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}