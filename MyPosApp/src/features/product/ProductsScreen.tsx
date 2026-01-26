import React, {useEffect} from 'react';
import {View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useTranslation} from 'react-i18next';
import {ProductCard} from "../../components/ProductCard";
import {useProductStore} from "../../store/useProductStore";
import {Product} from "../../types/product";
import {useRouter} from "expo-router";

const CATEGORIES = ['All', 'Food', 'Drinks', 'Snacks'];

export default function ProductsScreen() {
    const router = useRouter();
    const {t} = useTranslation();

    const {
        filteredProducts,
        isLoading,
        fetchProducts,
        searchProducts,
        filterByCategory,
        activeCategory
    } = useProductStore();

    useEffect(() => {
        fetchProducts();
    }, []);

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
                        <ProductCard product={item} onPress={handleProductPress}/>
                    )}
                    ListEmptyComponent={
                        <View className="items-center mt-20">
                            <Ionicons name="cube-outline" size={50} color="#cbd5e1"/>
                            <Text className="text-slate-400 mt-4">No products found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}