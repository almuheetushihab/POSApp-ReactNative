import React from 'react';
import {View, Text, Image, TouchableOpacity, Alert} from 'react-native';
import {Product} from '../types/product';
import {Ionicons} from '@expo/vector-icons';

interface ProductCardProps {
    product: Product;
    onAdd: (product: Product) => void;
    onPress?: (product: Product) => void;
    onRemove: (productId: string) => void;
    quantity?: number;
}

const LOW_STOCK_THRESHOLD = 10; // Define a threshold for low stock

export const ProductCard = ({product, onAdd, onRemove, onPress, quantity = 0}: ProductCardProps) => {
    const availableStock = product.stock - quantity;

    const isOutOfStock = product.stock <= 0; // Check original stock
    const isAddToCartDisabled = availableStock <= 0; // Check if user can add more
    
    // New state to identify low stock
    const isLowStock = !isOutOfStock && product.stock <= LOW_STOCK_THRESHOLD;

    const handleAdd = () => {
        if (isAddToCartDisabled) {
            Alert.alert("Limit Reached", `Only ${product.stock} items available in stock.`);
            return;
        }
        onAdd(product);
    };

    return (
        <View className={`flex-1 bg-white dark:bg-slate-800 m-2 p-3 rounded-2xl shadow-sm border 
            ${quantity > 0 ? 'border-blue-500 border-2' : 'border-gray-100 dark:border-slate-700'}
            ${isOutOfStock ? 'opacity-60 bg-gray-50' : ''}`}
        >
            <TouchableOpacity
                disabled={isOutOfStock}
                onPress={() => onPress && onPress(product)}
                className="items-center justify-center bg-gray-50 dark:bg-slate-700 rounded-xl h-28 mb-3 relative overflow-hidden"
            >
                {product.image ? (
                    <Image source={{uri: product.image}} className="h-16 w-16" resizeMode="contain"/>
                ) : (
                    <Ionicons name="image-outline" size={40} color="#94a3b8"/>
                )}

                {/* Out of Stock Badge */}
                {isOutOfStock && (
                    <View className="absolute w-full h-full bg-black/50 items-center justify-center z-10">
                        <Text className="text-white font-bold text-[10px] bg-red-600 px-2 py-1 rounded shadow-sm">
                            OUT OF STOCK
                        </Text>
                    </View>
                )}

                {/* Low Stock Badge */}
                {isLowStock && !isOutOfStock && (
                    <View className="absolute top-1 right-1 bg-yellow-500 px-2 py-1 rounded-full shadow z-10">
                        <Text className="text-yellow-900 font-bold text-[9px]">LOW STOCK</Text>
                    </View>
                )}
            </TouchableOpacity>

            <View>
                <TouchableOpacity onPress={() => onPress && onPress(product)}>
                    <Text
                        className={`text-slate-800 dark:text-white font-bold text-lg ${isOutOfStock ? 'text-slate-500' : ''}`}
                        numberOfLines={1}>
                        {product.name}
                    </Text>
                </TouchableOpacity>

                <Text
                    className={`text-xs mb-2 font-medium ${
                        isOutOfStock ? 'text-red-500 font-bold' : 
                        isLowStock ? 'text-yellow-600 dark:text-yellow-500' : 
                        'text-slate-500 dark:text-slate-400'
                    }`}>
                    {isOutOfStock
                        ? 'Stock Out'
                        : `Available: ${availableStock} / ${product.stock}`}
                </Text>

                <View className="flex-row justify-between items-center mt-1">
                    <Text className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                        ৳{product.price}
                    </Text>

                    {!isOutOfStock && (
                        quantity > 0 ? (
                            <View className="flex-row items-center bg-blue-100 dark:bg-blue-900 rounded-full">
                                <TouchableOpacity
                                    onPress={() => onRemove(product.id)}
                                    className="p-1.5 bg-blue-200 dark:bg-slate-700 rounded-full"
                                >
                                    <Ionicons name="remove" size={16} color="#2563eb"/>
                                </TouchableOpacity>

                                <Text className="font-bold text-slate-800 dark:text-white mx-2 w-8 text-center">
                                    {quantity}
                                </Text>

                                <TouchableOpacity
                                    onPress={handleAdd}
                                    disabled={isAddToCartDisabled}
                                    className={`p-1.5 rounded-full ${isAddToCartDisabled ? 'bg-gray-400' : 'bg-blue-600'}`}
                                >
                                    <Ionicons name="add" size={16} color="white"/>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={handleAdd}
                                disabled={isAddToCartDisabled}
                                className={`p-2 rounded-full ${isAddToCartDisabled ? 'bg-gray-200' : 'bg-blue-100 dark:bg-blue-900/40'}`}
                            >
                                <Ionicons name="add" size={20} color={isAddToCartDisabled ? '#9ca3af' : '#2563eb'}/>
                            </TouchableOpacity>
                        )
                    )}
                </View>
            </View>
        </View>
    );
};