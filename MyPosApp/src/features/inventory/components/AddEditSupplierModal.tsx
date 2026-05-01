import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Supplier } from '../../../types/supplier';

interface AddEditSupplierModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (supplierData: Omit<Supplier, 'id' | 'createdAt'>) => void;
    initialData?: Supplier | null;
}

export function AddEditSupplierModal({ visible, onClose, onSubmit, initialData }: AddEditSupplierModalProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');

    const isEditMode = !!initialData;

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setPhone(initialData.phone);
            setContactPerson(initialData.contactPerson || '');
            setEmail(initialData.email || '');
            setAddress(initialData.address || '');
        } else {
            // Reset form when opening for a new supplier
            setName('');
            setPhone('');
            setContactPerson('');
            setEmail('');
            setAddress('');
        }
    }, [initialData, visible]);

    const handleSubmit = () => {
        if (!name.trim() || !phone.trim()) {
            Alert.alert('Validation Error', 'Supplier name and phone number are required.');
            return;
        }
        
        onSubmit({
            name,
            phone,
            contactPerson,
            email,
            address,
        });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/60">
                <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 h-[85%]">
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-2xl font-bold text-slate-800 dark:text-white">
                            {isEditMode ? 'Edit Supplier' : 'Add New Supplier'}
                        </Text>
                        <TouchableOpacity onPress={onClose} className="bg-gray-100 dark:bg-slate-800 p-2 rounded-full">
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Form Inputs */}
                        <View className="mb-4">
                            <Text className="text-slate-600 dark:text-slate-400 mb-1 font-medium">Supplier Name <Text className="text-red-500">*</Text></Text>
                            <TextInput
                                className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 font-medium"
                                value={name}
                                onChangeText={setName}
                                placeholder="e.g. Acme Corporation"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-slate-600 dark:text-slate-400 mb-1 font-medium">Phone Number <Text className="text-red-500">*</Text></Text>
                            <TextInput
                                className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 font-medium"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                placeholder="e.g. 01XXXXXXXXX"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-slate-600 dark:text-slate-400 mb-1 font-medium">Contact Person (Optional)</Text>
                            <TextInput
                                className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 font-medium"
                                value={contactPerson}
                                onChangeText={setContactPerson}
                                placeholder="e.g. John Doe"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-slate-600 dark:text-slate-400 mb-1 font-medium">Email (Optional)</Text>
                            <TextInput
                                className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 font-medium"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholder="e.g. contact@example.com"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        <View className="mb-8">
                            <Text className="text-slate-600 dark:text-slate-400 mb-1 font-medium">Address (Optional)</Text>
                            <TextInput
                                className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 font-medium"
                                value={address}
                                onChangeText={setAddress}
                                multiline
                                numberOfLines={3}
                                placeholder="e.g. 123 Main St, Dhaka"
                                placeholderTextColor="#94a3b8"
                                style={{textAlignVertical: 'top'}}
                            />
                        </View>
                    </ScrollView>

                    {/* Submit Button */}
                    <View className="pt-4 border-t border-gray-100 dark:border-slate-800">
                        <TouchableOpacity
                            onPress={handleSubmit}
                            className="bg-blue-600 p-4 rounded-xl items-center active:bg-blue-700 flex-row justify-center gap-2"
                        >
                            <Ionicons name={isEditMode ? "checkmark-circle-outline" : "add-circle-outline"} size={20} color="white" />
                            <Text className="text-white font-bold text-base">
                                {isEditMode ? 'Save Changes' : 'Add Supplier'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
