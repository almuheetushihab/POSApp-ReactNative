import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {useProductStore} from "../../store/useProductStore";

export default function ProductDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const {updateProduct} = useProductStore();

    const [name, setName] = useState(params.name as string);
    const [price, setPrice] = useState(params.price as string);
    const [stock, setStock] = useState(params.stock as string);
    const [image, setImage] = useState(params.image as string);

    const pickImage = async () => {
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = () => {
        if (!name || !price || !stock) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        const updatedItem = {
            id: params.id as string,
            name: name,
            price: parseFloat(price),
            stock: parseInt(stock),
            image: image,
            category: params.category as string,
        };

        updateProduct(updatedItem);

        Alert.alert("Success", "Product updated successfully!", [
            {text: "OK", onPress: () => router.back()}
        ]);
    };

    const handleDelete = () => {
        Alert.alert("Delete Product", "Are you sure?", [
            {text: "Cancel", style: "cancel"},
            {text: "Delete", style: "destructive", onPress: () => router.back()}
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">

            {/* Header */}
            <View
                className="flex-row justify-between items-center p-5 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
                <TouchableOpacity onPress={() => router.back()}
                                  className="p-2 rounded-full bg-gray-100 dark:bg-slate-800">
                    <Ionicons name="arrow-back" size={24} color="#64748b"/>
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-800 dark:text-white">Edit Product</Text>
                <TouchableOpacity onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={24} color="#ef4444"/>
                </TouchableOpacity>
            </View>

            <ScrollView className="p-5">

                {/* Image Upload Section */}
                <View className="items-center justify-center mb-8">
                    <TouchableOpacity onPress={pickImage} className="active:opacity-70">
                        <View
                            className="h-40 w-40 bg-white dark:bg-slate-800 rounded-2xl items-center justify-center shadow-sm border border-gray-200 dark:border-slate-700 relative overflow-hidden">
                            {image ? (
                                <Image source={{uri: image}} className="h-full w-full" resizeMode="cover"/>
                            ) : (
                                <Ionicons name="image-outline" size={60} color="#cbd5e1"/>
                            )}

                            {/* Camera Icon Overlay */}
                            <View className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-tl-xl">
                                <Ionicons name="camera" size={20} color="white"/>
                            </View>
                        </View>
                        <Text className="text-center mt-3 text-blue-600 font-medium">Change Photo</Text>
                    </TouchableOpacity>
                </View>

                {/* Form Inputs */}
                <View
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4">

                    <View>
                        <Text className="text-slate-500 dark:text-slate-400 font-medium mb-2">Product Name</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-slate-800 dark:text-white font-semibold text-lg border border-gray-200 dark:border-slate-700"
                        />
                    </View>

                    <View className="flex-row gap-4 mt-4">
                        <View className="flex-1">
                            <Text className="text-slate-500 dark:text-slate-400 font-medium mb-2">Price (৳)</Text>
                            <TextInput
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                                className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-slate-800 dark:text-white font-bold text-lg border border-gray-200 dark:border-slate-700"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-slate-500 dark:text-slate-400 font-medium mb-2">Stock (Qty)</Text>
                            <TextInput
                                value={stock}
                                onChangeText={setStock}
                                keyboardType="numeric"
                                className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-slate-800 dark:text-white font-bold text-lg border border-gray-200 dark:border-slate-700"
                            />
                        </View>
                    </View>

                    <View className="mt-4">
                        <Text className="text-slate-500 dark:text-slate-400 font-medium mb-2">Category</Text>
                        <View
                            className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                            <Text className="text-blue-600 dark:text-blue-400 font-semibold">{params.category}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View className="p-5 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
                <TouchableOpacity
                    onPress={handleSave}
                    className="bg-blue-600 w-full p-4 rounded-xl items-center shadow-lg shadow-blue-200 dark:shadow-none active:bg-blue-700"
                >
                    <Text className="text-white font-bold text-lg">Save Changes</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}