import React, {useState, useEffect} from 'react';
import {
    View, Text, Modal, TextInput, TouchableOpacity, Pressable, ScrollView, Alert, Image, KeyboardAvoidingView, Platform, Switch
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {useProductStore} from '../store/useProductStore';
import {Product, ProductCategory, ProductAttributes} from '../types/product';

interface AddProductModalProps {
    visible: boolean;
    onClose: () => void;
    productToEdit?: Product | null;
}

const CATEGORIES: ProductCategory[] = ['Food', 'Drinks', 'Snacks', 'Electronics', 'Fashion', 'Pharmacy', 'Grocery', 'Other'];

export const AddProductModal = ({visible, onClose, productToEdit}: AddProductModalProps) => {
    const {addProduct, updateProduct} = useProductStore();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [category, setCategory] = useState<ProductCategory>('Other');
    const [barcode, setBarcode] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [attributes, setAttributes] = useState<ProductAttributes>({});

    useEffect(() => {
        if (productToEdit) {
            setName(productToEdit.name);
            setPrice(productToEdit.price.toString());
            setStock(productToEdit.stock.toString());
            setCategory(productToEdit.category);
            setBarcode(productToEdit.barcode || '');
            setImage(productToEdit.image || null);
            setAttributes(productToEdit.attributes || {});
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
        setCategory('Other');
        setAttributes({});
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

    const handleAttributeChange = (key: keyof ProductAttributes, value: any) => {
        setAttributes(prev => ({ ...prev, [key]: value }));
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
            image: image || undefined,
            attributes,
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

    const renderAttributeFields = () => {
        switch (category) {
            case 'Electronics':
                return (
                    <>
                        <AttributeInput label="Serial Number" value={attributes.serialNumber} onChange={v => handleAttributeChange('serialNumber', v)} placeholder="e.g., SN12345" />
                        <AttributeInput label="Warranty Period" value={attributes.warranty?.period} onChange={v => handleAttributeChange('warranty', { ...attributes.warranty, period: v })} placeholder="e.g., 12 months" />
                    </>
                );
            case 'Fashion':
                return (
                    <>
                        <AttributeInput label="Size" value={attributes.size} onChange={v => handleAttributeChange('size', v)} placeholder="e.g., M, L, XL" />
                        <AttributeInput label="Color" value={attributes.color} onChange={v => handleAttributeChange('color', v)} placeholder="e.g., Red, Blue" />
                        <AttributeInput label="Material" value={attributes.material} onChange={v => handleAttributeChange('material', v)} placeholder="e.g., Cotton" />
                    </>
                );
            case 'Pharmacy':
                return (
                    <>
                        <AttributeInput label="Expiry Date" value={attributes.expiryDate} onChange={v => handleAttributeChange('expiryDate', v)} placeholder="YYYY-MM-DD" />
                        <AttributeInput label="Batch Number" value={attributes.batchNumber} onChange={v => handleAttributeChange('batchNumber', v)} placeholder="e.g., B123" />
                        <AttributeInput label="Manufacturer" value={attributes.manufacturer} onChange={v => handleAttributeChange('manufacturer', v)} placeholder="e.g., Pharma Inc." />
                    </>
                );
            case 'Grocery':
                 return (
                    <>
                        <AttributeInput label="Weight" value={attributes.weight} onChange={v => handleAttributeChange('weight', v)} placeholder="e.g., 500g, 1kg" />
                        <AttributeInput label="Brand" value={attributes.brand} onChange={v => handleAttributeChange('brand', v)} placeholder="e.g., Fresh Farms" />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white dark:bg-slate-950">
                <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-slate-800">
                    <Text className="text-2xl font-bold text-slate-800 dark:text-white">{productToEdit ? 'Edit Product' : 'New Product'}</Text>
                    <TouchableOpacity onPress={onClose} className="bg-gray-100 dark:bg-slate-800 p-2 rounded-full"><Ionicons name="close" size={24} color="#64748b"/></TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding: 24, paddingBottom: 50}}>
                    <View className="items-center mb-8">
                        <TouchableOpacity onPress={pickImage} className="h-36 w-36 bg-slate-50 dark:bg-slate-900 rounded-3xl items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden">
                            {image ? <Image source={{uri: image}} className="h-full w-full" resizeMode="cover"/> : <View className="items-center"><View className="bg-blue-50 dark:bg-slate-800 p-4 rounded-full mb-2"><Ionicons name="camera" size={32} color="#3b82f6"/></View><Text className="text-slate-400 font-medium text-sm">Upload Image</Text></View>}
                        </TouchableOpacity>
                    </View>

                    <FormInput label="Product Name" value={name} onChange={setName} placeholder="Ex: Chicken Burger" />
                    <View className="flex-row gap-4 mb-6">
                        <FormInput label="Price" value={price} onChange={setPrice} placeholder="0.00" keyboardType="numeric" containerClass="flex-1" />
                        <FormInput label="Stock" value={stock} onChange={setStock} placeholder="0" keyboardType="numeric" containerClass="flex-1" />
                    </View>

                    <View className="mb-6">
                        <Text className="text-slate-700 dark:text-slate-300 font-semibold mb-3 ml-1">Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                            {CATEGORIES.map(cat => (
                                <Pressable key={cat} onPress={() => setCategory(cat)} className={`px-6 py-3 rounded-xl border mr-3 ${category === cat ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                                    <Text className={`font-semibold ${category === cat ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>{cat}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>

                    {renderAttributeFields()}
                    
                    <FormInput label="Barcode (Optional)" value={barcode} onChange={setBarcode} placeholder="Scan or type code" icon="scan-outline" />

                    <TouchableOpacity onPress={handleSubmit} className="bg-blue-600 h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-300 active:bg-blue-700 my-6">
                        <Text className="text-white font-bold text-lg tracking-wide">{productToEdit ? 'Update Product' : 'Save Product'}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const FormInput = ({ label, value, onChange, placeholder, keyboardType = 'default', containerClass = '', icon }: any) => (
    <View className={`mb-6 ${containerClass}`}>
        <Text className="text-slate-700 dark:text-slate-300 font-semibold mb-2 ml-1">{label}</Text>
        <View className="flex-row items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4">
            {icon && <Ionicons name={icon} size={22} color="#64748b" className="mr-2"/>}
            <TextInput
                className="flex-1 p-4 text-slate-800 dark:text-white text-base"
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                keyboardType={keyboardType}
                value={value}
                onChangeText={onChange}
            />
        </View>
    </View>
);

const AttributeInput = ({ label, value, onChange, placeholder }: { label: string, value: any, onChange: (text: string) => void, placeholder: string }) => (
    <FormInput label={label} value={value} onChange={onChange} placeholder={placeholder} />
);
