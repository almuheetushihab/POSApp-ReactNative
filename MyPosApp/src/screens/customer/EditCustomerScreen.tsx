import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useCustomerStore } from '../../store/useCustomerStore';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomerDetails } from '../../types/order';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomInput } from '../../components/CustomInput';
import { validateCustomer } from '../../utils/validation';

const EditCustomerScreen = () => {
    const {customers, updateCustomer} = useCustomerStore();
    const {id} = useLocalSearchParams();
    const [customer, setCustomer] = useState<Partial<CustomerDetails> | null>(null);
    const [errors, setErrors] = useState<{name?: string; phone?: string; email?: string}>({});

    useEffect(() => setCustomer(customers.find((item) => item.id === id) || null), [id, customers]);

    const handleUpdateCustomer = () => {
        if (!customer?.id) return;
        const nextErrors = validateCustomer({name: customer.name || '', phone: customer.phone || '', email: customer.email || ''});
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;
        updateCustomer(customer.id, customer);
        router.back();
    };

    if (!customer) return <View className="flex-1 items-center justify-center bg-slate-50"><ActivityIndicator size="large" color="#3b82f6" /></View>;
    const change = (field: keyof CustomerDetails, value: string) => setCustomer({...customer, [field]: value});

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
            <SafeAreaView edges={['bottom']} className="flex-1 bg-slate-50 dark:bg-slate-950">
                <ScrollView className="flex-1" contentContainerStyle={{padding: 24}} keyboardShouldPersistTaps="handled">
                    <Text className="mb-7 text-2xl font-bold text-slate-900 dark:text-white">Edit customer</Text>
                    <CustomInput label="Customer name" required error={errors.name} value={customer.name} placeholder="Enter full name"
                        onChangeText={(value) => {change('name', value); if (errors.name) setErrors({...errors, name: undefined});}} />
                    <CustomInput label="Phone number" required error={errors.phone} value={customer.phone} placeholder="Enter phone number"
                        onChangeText={(value) => {change('phone', value.replace(/\D/g, '').slice(0, 15)); if (errors.phone) setErrors({...errors, phone: undefined});}} keyboardType="number-pad" />
                    <CustomInput label="Email" error={errors.email} value={customer.email || ''} placeholder="Enter email address"
                        onChangeText={(value) => {change('email', value); if (errors.email) setErrors({...errors, email: undefined});}} keyboardType="email-address" autoCapitalize="none" />
                    <CustomInput label="Address" value={customer.address || ''} placeholder="Enter full address" onChangeText={(value) => change('address', value)}
                        multiline textAlignVertical="top" className="min-h-[96px]" />
                    <TouchableOpacity className="mt-2 h-14 items-center justify-center rounded-2xl bg-blue-600" onPress={handleUpdateCustomer}>
                        <Text className="text-base font-bold text-white">Update customer</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

export default EditCustomerScreen;
