import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useCustomerStore } from '../../store/useCustomerStore';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomInput } from '../../components/CustomInput';
import { validateCustomer } from '../../utils/validation';

const AddCustomerScreen = () => {
    const { addCustomer } = useCustomerStore();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<{name?: string; phone?: string; email?: string}>({});

    const handleAddCustomer = () => {
        const nextErrors = validateCustomer({name, phone, email});
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;
        addCustomer({id: Date.now().toString(), name: name.trim(), phone: phone.trim(), address: address.trim(), email: email.trim()});
        router.back();
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
            <SafeAreaView edges={['bottom']} className="flex-1 bg-slate-50 dark:bg-slate-950">
                <ScrollView className="flex-1" contentContainerStyle={{padding: 24}} keyboardShouldPersistTaps="handled">
                    <Text className="text-2xl font-bold text-slate-900 dark:text-white">Add customer</Text>
                    <Text className="mb-7 mt-1 text-sm text-slate-500 dark:text-slate-400">Save details for faster checkout and receipts.</Text>
                    <CustomInput label="Customer name" required error={errors.name} placeholder="Enter full name" value={name}
                        onChangeText={(value) => {setName(value); if (errors.name) setErrors({...errors, name: undefined});}} />
                    <CustomInput label="Phone number" required error={errors.phone} placeholder="Enter phone number" value={phone}
                        onChangeText={(value) => {setPhone(value); if (errors.phone) setErrors({...errors, phone: undefined});}} keyboardType="phone-pad" />
                    <CustomInput label="Email" error={errors.email} placeholder="Enter email address" value={email}
                        onChangeText={(value) => {setEmail(value); if (errors.email) setErrors({...errors, email: undefined});}} keyboardType="email-address" autoCapitalize="none" />
                    <CustomInput label="Address" placeholder="Enter full address" value={address} onChangeText={setAddress}
                        multiline textAlignVertical="top" className="min-h-[96px]" />
                    <TouchableOpacity className="mt-2 h-14 items-center justify-center rounded-2xl bg-blue-600" onPress={handleAddCustomer}>
                        <Text className="text-base font-bold text-white">Save customer</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

export default AddCustomerScreen;
