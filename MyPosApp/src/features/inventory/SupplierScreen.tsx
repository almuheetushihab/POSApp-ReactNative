import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSupplierStore } from '../../store/useSupplierStore';
import { Supplier } from '../../types/supplier';
import { AddEditSupplierModal } from './components/AddEditSupplierModal';

// A simple card component for displaying supplier info
const SupplierCard = ({ supplier, onEdit, onDelete }: { supplier: Supplier, onEdit: () => void, onDelete: () => void }) => (
    <View className="bg-white dark:bg-slate-800 p-4 rounded-xl mb-3 shadow-sm border border-gray-100 dark:border-slate-700">
        <View className="flex-row justify-between items-start">
            <View className="flex-1">
                <Text className="text-lg font-bold text-slate-800 dark:text-white">{supplier.name}</Text>
                <Text className="text-slate-500 dark:text-slate-400 mt-1">{supplier.phone}</Text>
                {supplier.contactPerson && <Text className="text-slate-500 dark:text-slate-400">Attn: {supplier.contactPerson}</Text>}
            </View>
            <View className="flex-row gap-2">
                <TouchableOpacity onPress={onEdit} className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Ionicons name="pencil" size={18} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete} className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    </View>
);

export default function SupplierScreen() {
    const { suppliers, fetchSuppliers, addSupplier, updateSupplier, deleteSupplier } = useSupplierStore();
    
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleAddNew = () => {
        setEditingSupplier(null);
        setIsModalVisible(true);
    };

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsModalVisible(true);
    };

    const handleDelete = (supplierId: string) => {
        Alert.alert(
            "Confirm Deletion",
            "Are you sure you want to delete this supplier? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: () => deleteSupplier(supplierId) 
                }
            ]
        );
    };

    const handleFormSubmit = (supplierData: Omit<Supplier, 'id' | 'createdAt'>) => {
        if (editingSupplier) {
            // Update existing supplier
            updateSupplier({ ...editingSupplier, ...supplierData });
            Alert.alert("Success", "Supplier updated successfully!");
        } else {
            // Add new supplier
            addSupplier(supplierData);
            Alert.alert("Success", "Supplier added successfully!");
        }
        setIsModalVisible(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
                <Text className="text-2xl font-bold text-slate-800 dark:text-white">Suppliers</Text>
                <TouchableOpacity 
                    onPress={handleAddNew}
                    className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center gap-2"
                >
                    <Ionicons name="add" size={20} color="white" />
                    <Text className="text-white font-bold">Add New</Text>
                </TouchableOpacity>
            </View>

            {/* Supplier List */}
            <FlatList
                data={suppliers}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                    <SupplierCard 
                        supplier={item}
                        onEdit={() => handleEdit(item)}
                        onDelete={() => handleDelete(item.id)}
                    />
                )}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center mt-20">
                        <Ionicons name="people-outline" size={50} color="#cbd5e1" />
                        <Text className="text-slate-400 mt-2">No suppliers found. Add one to get started.</Text>
                    </View>
                }
            />

            {/* Add/Edit Modal */}
            <AddEditSupplierModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSubmit={handleFormSubmit}
                initialData={editingSupplier}
            />
        </SafeAreaView>
    );
}
