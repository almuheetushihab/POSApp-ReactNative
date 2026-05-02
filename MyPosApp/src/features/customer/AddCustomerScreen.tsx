import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useCustomerStore } from '../../store/useCustomerStore';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const AddCustomerScreen = () => {
    const { addCustomer } = useCustomerStore();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');

    const handleAddCustomer = () => {
        if (!name.trim() || !phone.trim()) {
            alert('Customer Name and Phone are required.');
            return;
        }
        addCustomer({
            id: Date.now().toString(),
            name,
            phone,
            address,
            email,
        });
        router.back();
    };

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
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-base font-medium text-slate-600 dark:text-slate-300 mb-2">Phone Number*</Text>
                        <TextInput
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg h-12 px-4 text-slate-800 dark:text-white"
                            placeholder="Enter phone number"
                            placeholderTextColor="#94a3b8"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-base font-medium text-slate-600 dark:text-slate-300 mb-2">Email (Optional)</Text>
                        <TextInput
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg h-12 px-4 text-slate-800 dark:text-white"
                            placeholder="Enter email address"
                            placeholderTextColor="#94a3b8"
                            value={email}
                            onChangeText={setEmail}
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
                            value={address}
                            onChangeText={setAddress}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-blue-600 h-12 rounded-lg items-center justify-center"
                        onPress={handleAddCustomer}
                    >
                        <Text className="text-white font-bold text-base">Save Customer</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

export default AddCustomerScreen;