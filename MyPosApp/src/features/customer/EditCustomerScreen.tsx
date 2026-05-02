import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useCustomerStore } from '../../store/useCustomerStore';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomerDetails } from '../../types/order';
import { SafeAreaView } from 'react-native-safe-area-context';

const EditCustomerScreen = () => {
    const { customers, updateCustomer } = useCustomerStore();
    const { id } = useLocalSearchParams();
    const [customer, setCustomer] = useState<Partial<CustomerDetails> | null>(null);

    useEffect(() => {
        const customerToEdit = customers.find((c) => c.id === id);
        if (customerToEdit) {
            setCustomer(customerToEdit);
        }
    }, [id, customers]);

    const handleUpdateCustomer = () => {
        if (customer && customer.id) {
            if (!customer.name?.trim() || !customer.phone?.trim()) {
                alert('Customer Name and Phone are required.');
                return;
            }
            updateCustomer(customer.id, customer);
            router.back();
        }
    };

    const handleChange = (field: keyof CustomerDetails, value: string) => {
        if (customer) {
            setCustomer({ ...customer, [field]: value });
        }
    };

    if (!customer) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-slate-500 mt-4">Loading customer...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <SafeAreaView edges={['bottom']} className="flex-1 bg-slate-50 dark:bg-slate-950">
                <View className="p-6 flex-1">
                    <View className="mb-4">
                        <Text className="text-base font-medium text-slate-600 dark:text-slate-300 mb-2">Customer Name*</Text>
                        <TextInput
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg h-12 px-4 text-slate-800 dark:text-white"
                            placeholder="Enter full name"
                            placeholderTextColor="#94a3b8"
                            value={customer.name}
                            onChangeText={(val) => handleChange('name', val)}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-base font-medium text-slate-600 dark:text-slate-300 mb-2">Phone Number*</Text>
                        <TextInput
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg h-12 px-4 text-slate-800 dark:text-white"
                            placeholder="Enter phone number"
                            placeholderTextColor="#94a3b8"
                            value={customer.phone}
                            onChangeText={(val) => handleChange('phone', val)}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-base font-medium text-slate-600 dark:text-slate-300 mb-2">Email (Optional)</Text>
                        <TextInput
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg h-12 px-4 text-slate-800 dark:text-white"
                            placeholder="Enter email address"
                            placeholderTextColor="#94a3b8"
                            value={customer.email || ''}
                            onChangeText={(val) => handleChange('email', val)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View className="mb-6">
                        <Text className="text-base font-medium text-slate-600 dark:text-slate-300 mb-2">Address (Optional)</Text>
                        <TextInput
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg h-24 px-4 py-3 text-slate-800 dark:text-white"
                            placeholder="Enter full address"
                            placeholderTextColor="#94a3b8"
                            value={customer.address || ''}
                            onChangeText={(val) => handleChange('address', val)}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-blue-600 h-12 rounded-lg items-center justify-center"
                        onPress={handleUpdateCustomer}
                    >
                        <Text className="text-white font-bold text-base">Update Customer</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

export default EditCustomerScreen;