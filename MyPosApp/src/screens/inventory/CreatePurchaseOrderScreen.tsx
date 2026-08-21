import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSupplierStore } from '../../store/useSupplierStore';
import { useProductStore } from '../../store/useProductStore';
import { usePurchaseOrderStore } from '../../store/usePurchaseOrderStore';
import { Supplier } from '../../types/supplier';
import { Product } from '../../types/product';
import { PurchaseOrderItem } from '../../types/purchaseOrder';

// Step 1: Select Supplier
// The component now takes full height and its FlatList can scroll independently.
const SelectSupplierStep = ({ onSelect }: { onSelect: (supplier: Supplier) => void }) => {
    const { suppliers } = useSupplierStore();
    return (
        <View className="flex-1">
            <Text className="text-xl font-bold text-slate-800 dark:text-white mb-4">Select a Supplier</Text>
            <FlatList
                data={suppliers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => onSelect(item)} className="bg-white dark:bg-slate-800 p-4 rounded-lg mb-2 border border-gray-200 dark:border-slate-700">
                        <Text className="text-slate-800 dark:text-white font-bold">{item.name}</Text>
                        <Text className="text-slate-500">{item.phone}</Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
};

// Step 2: Add Products
// The component now takes full height. The FlatList is the main scrollable element.
const AddProductsStep = ({ onAddProduct }: any) => {
    const { products } = useProductStore();
    const [search, setSearch] = useState('');
    
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <View className="flex-1">
            <Text className="text-xl font-bold text-slate-800 dark:text-white mb-4">Add Products to Order</Text>
            <TextInput
                placeholder="Search for products..."
                placeholderTextColor="#94a3b8"
                value={search}
                onChangeText={setSearch}
                className="bg-white dark:bg-slate-800 p-3 rounded-lg mb-4 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-white"
            />
            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => onAddProduct(item)} className="bg-white dark:bg-slate-800 p-3 rounded-lg mb-2 flex-row justify-between items-center border border-gray-200 dark:border-slate-700">
                        <Text className="text-slate-800 dark:text-white">{item.name}</Text>
                        <Ionicons name="add-circle" size={24} color="#2563eb" />
                    </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
};


export default function CreatePurchaseOrderScreen() {
    const router = useRouter();
    const { addPurchaseOrder } = usePurchaseOrderStore();

    const [step, setStep] = useState(1); // 1: Select Supplier, 2: Add Products, 3: Review
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [items, setItems] = useState<PurchaseOrderItem[]>([]);
    const [notes, setNotes] = useState('');

    const handleSelectSupplier = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setStep(2);
    };

    const handleAddProduct = (product: Product) => {
        if (items.find(item => item.productId === product.id)) {
            Alert.alert("Already Added", `${product.name} is already in the order.`);
            return;
        }
        const newItem: PurchaseOrderItem = {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            purchasePrice: product.purchasePrice || product.price,
        };
        setItems(prev => [...prev, newItem]);
    };

    const handleUpdateItem = (productId: string, newQty: string, newPrice: string) => {
        setItems(prev => prev.map(item => 
            item.productId === productId 
            ? { ...item, quantity: parseInt(newQty) || 1, purchasePrice: parseFloat(newPrice) || 0 }
            : item
        ));
    };

    const handleRemoveItem = (productId: string) => {
        setItems(prev => prev.filter(item => item.productId !== productId));
    };
    
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0);

    const handleSubmitOrder = () => {
        if (!selectedSupplier) {
            Alert.alert("Error", "Supplier is not selected.");
            return;
        }
        if (items.length === 0) {
            Alert.alert("Error", "You must add at least one product to the order.");
            return;
        }

        addPurchaseOrder({
            supplierId: selectedSupplier.id,
            items,
            notes,
        });

        Alert.alert("Success", "Purchase order created successfully!", [
            { text: "OK", onPress: () => router.back() }
        ]);
    };

    // This function renders the content for the current step
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <View className="flex-1 p-4">
                        <SelectSupplierStep onSelect={handleSelectSupplier} />
                    </View>
                );
            case 2:
                return (
                    <View className="flex-1 p-4">
                        <AddProductsStep onAddProduct={handleAddProduct} />
                        
                        {items.length > 0 && (
                            <TouchableOpacity onPress={() => setStep(3)} className="bg-blue-600 p-4 rounded-lg mt-4 items-center">
                                <Text className="text-white font-bold">Review Order ({items.length})</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                );
            case 3:
                return (
                    <ScrollView className="p-4">
                        <Text className="text-xl font-bold text-slate-800 dark:text-white mb-4">Review Order</Text>
                        <View className="bg-white dark:bg-slate-800 p-4 rounded-lg mb-4">
                            <Text className="font-bold text-slate-800 dark:text-white">{selectedSupplier?.name}</Text>
                            <Text className="text-slate-500">{selectedSupplier?.phone}</Text>
                        </View>

                        {items.map(item => (
                            <View key={item.productId} className="bg-white dark:bg-slate-800 p-3 rounded-lg mb-2">
                                <Text className="font-bold text-slate-800 dark:text-white">{item.productName}</Text>
                                <View className="flex-row gap-2 mt-2">
                                    <TextInput placeholder="Qty" value={item.quantity.toString()} onChangeText={qty => handleUpdateItem(item.productId, qty, item.purchasePrice.toString())} className="flex-1 bg-gray-100 dark:bg-slate-700 p-2 rounded" keyboardType="numeric" />
                                    <TextInput placeholder="Price" value={item.purchasePrice.toString()} onChangeText={price => handleUpdateItem(item.productId, item.quantity.toString(), price)} className="flex-1 bg-gray-100 dark:bg-slate-700 p-2 rounded" keyboardType="numeric" />
                                    <TouchableOpacity onPress={() => handleRemoveItem(item.productId)} className="p-2 bg-red-100 dark:bg-red-900/30 rounded">
                                        <Ionicons name="trash" size={20} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                        
                        <TextInput
                            placeholder="Add notes for this order..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            className="bg-white dark:bg-slate-800 p-3 rounded-lg my-4 h-24 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-white"
                            placeholderTextColor="#94a3b8"
                        />
                        
                        <View className="flex-row justify-between items-center mt-4">
                            <Text className="text-lg font-bold text-slate-800 dark:text-white">Total:</Text>
                            <Text className="text-lg font-bold text-blue-600">৳{totalAmount.toFixed(2)}</Text>
                        </View>

                        <TouchableOpacity onPress={handleSubmitOrder} className="bg-green-600 p-4 rounded-lg mt-4 items-center">
                            <Text className="text-white font-bold">Submit Purchase Order</Text>
                        </TouchableOpacity>
                    </ScrollView>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            <View className="flex-row items-center p-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#64748b" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-800 dark:text-white">Create Purchase Order</Text>
            </View>

            {renderStepContent()}
        </SafeAreaView>
    );
}
