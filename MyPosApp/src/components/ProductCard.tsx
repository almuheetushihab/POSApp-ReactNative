import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {Product} from '../types/product';
import {Ionicons} from '@expo/vector-icons';

interface ProductCardProps {
    product: Product;
    onPress: (product: Product) => void;
}

export const ProductCard = ({product, onPress}: ProductCardProps) => {
    return (
        <TouchableOpacity
            onPress={() => onPress(product)}
            className="flex-1 bg-white dark:bg-slate-800 m-2 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700"
        >
            <View className="items-center justify-center bg-gray-50 dark:bg-slate-700 rounded-xl h-28 mb-3">
                {product.image ? (
                    <Image source={{uri: product.image}} className="h-16 w-16" resizeMode="contain"/>
                ) : (
                    <Ionicons name="image-outline" size={40} color="#94a3b8"/>
                )}
            </View>

            <View>
                <Text className="text-slate-800 dark:text-white font-bold text-lg" numberOfLines={1}>
                    {product.name}
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 text-xs mb-2">
                    Stock: {product.stock} pcs
                </Text>

                <View className="flex-row justify-between items-center">
                    <Text className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                        ৳{product.price}
                    </Text>
                    <View className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-full">
                        <Ionicons name="add" size={16} color="#2563eb"/>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};