import React, {useState, useEffect} from 'react';
import {
    View, Text, Modal, TextInput, TouchableOpacity, Pressable, ScrollView, Alert, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {useProductStore} from '../store/useProductStore';
import {Product} from '../types/product';

interface AddProductModalProps {
    visible: boolean;
    onClose: () => void;
    productToEdit?: Product | null;
}

export const AddProductModal = ({visible, onClose, productToEdit}: AddProductModalProps) => {
    const {addProduct, updateProduct} = useProductStore();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [category, setCategory] = useState('Food');
    const [barcode, setBarcode] = useState('');
    const [image, setImage] = useState<string | null>(null);

    useEffect(() => {
        if (productToEdit) {
            setName(productToEdit.name);
            setPrice(productToEdit.price.toString());
            setStock(productToEdit.stock.toString());
            setCategory(productToEdit.category);
            setBarcode(productToEdit.barcode || '');
            setImage(productToEdit.image || null);
        } else {
            resetForm();
        }
    }, [productToEdit, visible]);

    const resetForm = () => {
        setName('');
        setPrice('');
        setStock('');
        setBarcode('');
        setImage(null);
    };

    const pickImage = async () => {
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

    const handleSubmit = () => {
        if (!name || !price || !stock) {
            Alert.alert("Missing Info", "Please fill Name, Price and Stock.");
            return;
        }

        const productData: Product = {
            id: productToEdit ? productToEdit.id : Date.now().toString(),
            name,
            price: parseFloat(price),
            stock: parseInt(stock),
            category,
            barcode,
            image: image || undefined
        };

        if (productToEdit) {
            updateProduct(productData);
            Alert.alert("Updated", "Product updated successfully!");
        } else {
            addProduct(productData);
            Alert.alert("Success", "Product added successfully!");
        }

        onClose();
        resetForm();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 bg-white dark:bg-slate-950"
            >
                {/* Header */}
                <View
                    className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-slate-800">
                    <Text className="text-2xl font-bold text-slate-800 dark:text-white">
                        {productToEdit ? 'Edit Product' : 'New Product'}
                    </Text>
                    <TouchableOpacity
                        onPress={onClose}
                        className="bg-gray-100 dark:bg-slate-800 p-2 rounded-full"
                    >
                        <Ionicons name="close" size={24} color="#64748b"/>
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}
                            contentContainerStyle={{padding: 24, paddingBottom: 50}}>

                    {/* Image Picker */}
                    <View className="items-center mb-8">
                        <TouchableOpacity
                            onPress={pickImage}
                            className="h-36 w-36 bg-slate-50 dark:bg-slate-900 rounded-3xl items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden"
                        >
                            {image ? (
                                <Image source={{uri: image}} className="h-full w-full" resizeMode="cover"/>
                            ) : (
                                <View className="items-center">
                                    <View className="bg-blue-50 dark:bg-slate-800 p-4 rounded-full mb-2">
                                        <Ionicons name="camera" size={32} color="#3b82f6"/>
                                    </View>
                                    <Text className="text-slate-400 font-medium text-sm">Upload Image</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Product Name */}
                    <View className="mb-6">
                        <Text className="text-slate-700 dark:text-slate-300 font-semibold mb-2 ml-1">Product Name</Text>
                        <TextInput
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-slate-800 dark:text-white text-base"
                            placeholder="Ex: Chicken Burger"
                            placeholderTextColor="#94a3b8"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Price & Stock */}
                    <View className="flex-row gap-4 mb-6">
                        <View className="flex-1">
                            <Text className="text-slate-700 dark:text-slate-300 font-semibold mb-2 ml-1">Price</Text>
                            <TextInput
                                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-slate-800 dark:text-white text-base font-bold"
                                placeholder="0.00"
                                placeholderTextColor="#94a3b8"
                                keyboardType="numeric"
                                value={price}
                                onChangeText={setPrice}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-slate-700 dark:text-slate-300 font-semibold mb-2 ml-1">Stock</Text>
                            <TextInput
                                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-slate-800 dark:text-white text-base font-bold"
                                placeholder="0"
                                placeholderTextColor="#94a3b8"
                                keyboardType="numeric"
                                value={stock}
                                onChangeText={setStock}
                            />
                        </View>
                    </View>

                    {/* Category Selection (FIXED CRASH HERE) */}
                    <View className="mb-6">
                        <Text className="text-slate-700 dark:text-slate-300 font-semibold mb-3 ml-1">Category</Text>
                        <View className="flex-row flex-wrap gap-3">
                            {['Food', 'Drinks', 'Snacks', 'Other'].map((cat) => (
                                <Pressable
                                    key={cat}
                                    onPress={() => setCategory(cat)}
                                    className={`px-6 py-3 rounded-xl border ${
                                        category === cat
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    <Text
                                        className={`font-semibold ${category === cat ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                        {cat}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Barcode */}
                    <View className="mb-8">
                        <Text className="text-slate-700 dark:text-slate-300 font-semibold mb-2 ml-1">Barcode
                            (Optional)</Text>
                        <View
                            className="flex-row items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4">
                            <Ionicons name="scan-outline" size={22} color="#64748b"/>
                            <TextInput
                                className="flex-1 p-4 text-slate-800 dark:text-white text-base ml-2"
                                placeholder="Scan or type code"
                                placeholderTextColor="#94a3b8"
                                value={barcode}
                                onChangeText={setBarcode}
                            />
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        className="bg-blue-600 h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-300 active:bg-blue-700 mb-6"
                    >
                        <Text className="text-white font-bold text-lg tracking-wide">
                            {productToEdit ? 'Update Product' : 'Save Product'}
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
};