import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomerDetails } from '../../types/order';
import { useCustomerStore } from '../../store/useCustomerStore';
import { useSettingsStore } from '../../store/useSettingsStore';

interface AddEditCustomerModalProps {
    visible: boolean;
    onClose: () => void;
    customerToEdit: CustomerDetails | null;
}

export const AddEditCustomerModal = ({ visible, onClose, customerToEdit }: AddEditCustomerModalProps) => {
    const { addCustomer, updateCustomer } = useCustomerStore();
    const { activeStoreId } = useSettingsStore();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');

    const isEditMode = customerToEdit !== null;

    useEffect(() => {
        if (visible) {
            if (isEditMode) {
                setName(customerToEdit.name);
                setPhone(customerToEdit.phone);
                setEmail(customerToEdit.email || '');
                setAddress(customerToEdit.address || '');
            } else {
                // Reset form for new customer
                setName('');
                setPhone('');
                setEmail('');
                setAddress('');
            }
        }
    }, [visible, customerToEdit, isEditMode]);

    const handleSave = () => {
        if (!name.trim() || !phone.trim()) {
            Alert.alert('Validation Error', 'Customer name and phone number are required.');
            return;
        }

        if (isEditMode && customerToEdit.id) {
            updateCustomer(customerToEdit.id, { name, phone, email, address });
            Alert.alert('Success', 'Customer details updated successfully.');
        } else {
            addCustomer({ name, phone, email, address, storeId: activeStoreId });
            Alert.alert('Success', 'New customer added successfully.');
        }
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 justify-end"
            >
                <View className="flex-1 justify-end bg-black/60">
                    <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 shadow-xl max-h-[85%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-bold text-slate-800 dark:text-white">
                                {isEditMode ? 'Edit Customer' : 'Add New Customer'}
                            </Text>
                            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full">
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="mb-4">
                                <Text className="text-slate-600 dark:text-slate-400 mb-1 font-bold">Name <Text className="text-red-500">*</Text></Text>
                                <TextInput
                                    className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 font-medium"
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter full name"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-slate-600 dark:text-slate-400 mb-1 font-bold">Phone Number <Text className="text-red-500">*</Text></Text>
                                <TextInput
                                    className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 font-medium"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                    placeholder="Enter phone number"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-slate-600 dark:text-slate-400 mb-1 font-bold">Email (Optional)</Text>
                                <TextInput
                                    className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 font-medium"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    placeholder="Enter email address"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            <View className="mb-6">
                                <Text className="text-slate-600 dark:text-slate-400 mb-1 font-bold">Address (Optional)</Text>
                                <TextInput
                                    className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 font-medium"
                                    value={address}
                                    onChangeText={setAddress}
                                    placeholder="Enter full address"
                                    placeholderTextColor="#94a3b8"
                                    multiline
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleSave}
                                className="bg-blue-600 p-5 rounded-2xl items-center active:bg-blue-700 flex-row justify-center gap-2"
                            >
                                <Ionicons name="save-outline" size={20} color="white" />
                                <Text className="text-white font-bold text-lg">
                                    {isEditMode ? 'Save Changes' : 'Create Customer'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};