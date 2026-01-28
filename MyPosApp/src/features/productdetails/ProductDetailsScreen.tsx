import React, {useState} from 'react';
import {View, Text, Image, TouchableOpacity, ScrollView, Alert} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useProductStore} from "../../store/useProductStore";
import {AddProductModal} from "../../components/AddProductModal";


export default function ProductDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const {deleteProduct, products} = useProductStore();

    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const product = products.find(p => p.id === params.id);

    if (!product) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-slate-950">
                <Text className="text-slate-500 mb-4">Product not found!</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-blue-600 px-6 py-2 rounded-full">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const handleDelete = () => {
        Alert.alert(
            "Delete Product",
            `Are you sure you want to delete "${product.name}"?`,
            [
                {text: "Cancel", style: "cancel"},
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteProduct(product.id);
                        router.back();
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-950" edges={['top', 'left', 'right']}>
            <ScrollView showsVerticalScrollIndicator={false}>

                <View className="h-80 w-full bg-gray-100 dark:bg-slate-900 relative items-center justify-center">
                    {product.image ? (
                        <Image source={{uri: product.image}} className="h-64 w-64" resizeMode="contain"/>
                    ) : (
                        <Ionicons name="image-outline" size={80} color="#94a3b8"/>
                    )}

                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-4 left-4 bg-white/90 dark:bg-black/50 p-2.5 rounded-full shadow-sm z-10"
                    >
                        <Ionicons name="arrow-back" size={24} color="#333"/>
                    </TouchableOpacity>

                    <View className="absolute top-4 right-4 flex-row gap-3 z-10">
                        {/* Edit Button */}
                        <TouchableOpacity
                            onPress={() => setIsEditModalVisible(true)}
                            className="bg-white/90 dark:bg-black/50 p-2.5 rounded-full shadow-sm"
                        >
                            <Ionicons name="create-outline" size={24} color="#2563eb"/>
                        </TouchableOpacity>

                        {/* Delete Button */}
                        <TouchableOpacity
                            onPress={handleDelete}
                            className="bg-white/90 dark:bg-black/50 p-2.5 rounded-full shadow-sm"
                        >
                            <Ionicons name="trash-outline" size={24} color="#ef4444"/>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Details Body */}
                <View className="p-6 -mt-8 bg-white dark:bg-slate-950 rounded-t-[32px] shadow-lg flex-1">

                    {/* Name & Price */}
                    <View className="flex-row justify-between items-start mb-6">
                        <View className="flex-1 mr-4">
                            <Text className="text-2xl font-bold text-slate-800 dark:text-white mb-2 leading-tight">
                                {product.name}
                            </Text>
                            <View className="flex-row">
                                <View className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                                    <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase">
                                        {product.category}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <Text className="text-3xl font-bold text-blue-600">৳{product.price}</Text>
                    </View>

                    {/* Info Cards (Stock & Status) */}
                    <View className="flex-row gap-4 mb-8">
                        <View
                            className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl flex-1 items-center border border-slate-100 dark:border-slate-800">
                            <Text className="text-slate-400 text-xs uppercase font-bold mb-1">Stock Level</Text>
                            <Text className="text-xl font-bold text-slate-800 dark:text-white">{product.stock}</Text>
                        </View>
                        <View
                            className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl flex-1 items-center border border-slate-100 dark:border-slate-800">
                            <Text className="text-slate-400 text-xs uppercase font-bold mb-1">Status</Text>
                            <Text
                                className={`text-xl font-bold ${Number(product.stock) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {Number(product.stock) > 0 ? 'In Stock' : 'Out'}
                            </Text>
                        </View>
                    </View>

                    {/* Barcode Info */}
                    {product.barcode ? (
                        <View
                            className="flex-row items-center gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl mb-8 border border-slate-100 dark:border-slate-800">
                            <Ionicons name="barcode-outline" size={24} color="#64748b"/>
                            <View>
                                <Text className="text-slate-400 text-xs font-bold uppercase">Barcode</Text>
                                <Text
                                    className="text-slate-700 dark:text-slate-300 font-medium">{product.barcode}</Text>
                            </View>
                        </View>
                    ) : null}

                    {/* Description */}
                    <Text className="text-slate-800 dark:text-white font-bold text-lg mb-2">Description</Text>
                    <Text className="text-slate-500 dark:text-slate-400 leading-6">
                        This is a high-quality product from the {product.category} category.
                        Manage your inventory efficiently by tracking stock levels and updating prices as needed.
                    </Text>

                </View>
            </ScrollView>

            <AddProductModal
                visible={isEditModalVisible}
                onClose={() => setIsEditModalVisible(false)}
                productToEdit={product}
            />
        </SafeAreaView>
    );
}