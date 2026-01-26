import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {Product} from '../types/product';
import {Ionicons} from '@expo/vector-icons';

interface ProductCardProps {
    product: Product;
    onPress: (product: Product) => void;
    quantity?: number;
}

export const ProductCard = ({product, onPress, quantity = 0}: ProductCardProps) => {
    return (
        <TouchableOpacity
            onPress={() => onPress(product)}
            className={`flex-1 bg-white dark:bg-slate-800 m-2 p-3 rounded-2xl shadow-sm border 
      ${quantity > 0 ? 'border-blue-500 border-2' : 'border-gray-100 dark:border-slate-700'}`}
        >
            {quantity > 0 && (
                <View
                    className="absolute top-2 right-2 bg-red-500 h-7 w-7 rounded-full items-center justify-center z-10 border-2 border-white dark:border-slate-800">
                    <Text className="text-white font-bold text-xs">{quantity}</Text>
                </View>
            )}

            {/* Image Section */}
            <View className="items-center justify-center bg-gray-50 dark:bg-slate-700 rounded-xl h-28 mb-3">
                {product.image ? (
                    <Image source={{uri: product.image}} className="h-16 w-16" resizeMode="contain"/>
                ) : (
                    <Ionicons name="image-outline" size={40} color="#94a3b8"/>
                )}
            </View>

            {/* Info Section */}
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

                    <View
                        className={`p-1.5 rounded-full ${quantity > 0 ? 'bg-green-500' : 'bg-blue-100 dark:bg-blue-900/40'}`}>
                        <Ionicons
                            name={quantity > 0 ? "checkmark" : "add"}
                            size={16}
                            color={quantity > 0 ? "white" : "#2563eb"}
                        />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};