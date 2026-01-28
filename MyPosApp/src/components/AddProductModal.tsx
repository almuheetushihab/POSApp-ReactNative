import React, {useState} from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {useProductStore} from '../store/useProductStore';
import {Product} from '../types/product';

interface AddProductModalProps {
    visible: boolean;
    onClose: () => void;
}

export const AddProductModal = ({visible, onClose}: AddProductModalProps) => {
    const {addProduct} = useProductStore();

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [category, setCategory] = useState('Food');
    const [barcode, setBarcode] = useState('');
    const [image, setImage] = useState<string | null>(null);

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

        const newProduct: Product = {
            id: Date.now().toString(),
            name,
            price: parseFloat(price),
            stock: parseInt(stock),
            category,
            barcode,
            image: image || undefined
        };

        addProduct(newProduct);
        Alert.alert("Success", "Product added successfully!");

        // Reset Form
        setName('');
        setPrice('');
        setStock('');
        setBarcode('');
        setImage(null);
        onClose();
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
                    <Text className="text-2xl font-bold text-slate-800 dark:text-white">New Product</Text>
                    <TouchableOpacity
                        onPress={onClose}
                        className="bg-gray-100 dark:bg-slate-800 p-2 rounded-full"
                    >
                        <Ionicons name="close" size={24} color="#64748b"/>
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}
                            contentContainerStyle={{padding: 24, paddingBottom: 50}}>

                    {/* 1. Image Picker (Centered & Large) */}
                    <View className="items-center mb-8">
                        <TouchableOpacity
                            onPress={pickImage}
                            className="h-36 w-36 bg-slate-50 dark:bg-slate-900 rounded-3xl items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden"
                            activeOpacity={0.8}
                        >
                            {image ? (
                                <>
                                    <Image source={{uri: image}} className="h-full w-full" resizeMode="cover"/>
                                    <View className="absolute bottom-0 w-full bg-black/40 py-2 items-center">
                                        <Ionicons name="create-outline" size={16} color="white"/>
                                    </View>
                                </>
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

                    {/* 2. Product Name */}
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

                    {/* 3. Price & Stock Grid */}
                    <View className="flex-row gap-4 mb-6">
                        <View className="flex-1">
                            <Text className="text-slate-700 dark:text-slate-300 font-semibold mb-2 ml-1">Price</Text>
                            <View className="relative">
                                <Text className="absolute left-4 top-4 text-slate-400 font-bold">৳</Text>
                                <TextInput
                                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 pl-10 rounded-2xl text-slate-800 dark:text-white text-base font-bold"
                                    placeholder="0.00"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="numeric"
                                    value={price}
                                    onChangeText={setPrice}
                                />
                            </View>
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

                    {/* 4. Category Selection */}
                    <View className="mb-6">
                        <Text className="text-slate-700 dark:text-slate-300 font-semibold mb-3 ml-1">Category</Text>
                        <View className="flex-row flex-wrap gap-3">
                            {['Food', 'Drinks', 'Snacks', 'Other'].map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => setCategory(cat)}
                                    className={`px-6 py-3 rounded-xl border ${
                                        category === cat
                                            ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200'
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    <Text
                                        className={`font-semibold ${category === cat ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* 5. Barcode Scanner Field */}
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

                    {/* 6. Save Button */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        className="bg-blue-600 h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-300 active:bg-blue-700 mb-6"
                    >
                        <Text className="text-white font-bold text-lg tracking-wide">Save Product</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
};