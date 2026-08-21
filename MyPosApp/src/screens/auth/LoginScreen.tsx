import React, { useState } from 'react';
import {
    View, Text, Alert, TextInput, TouchableOpacity,
    TouchableWithoutFeedback, Keyboard, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { useTranslation } from 'react-i18next';
import { useAuthStore } from "../../store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";

export const LoginScreen = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { login } = useAuthStore();
    
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleLogin = async () => {
        if (pin.length !== 4) {
            Alert.alert('Error', 'Please enter a 4-digit PIN');
            return;
        }
        
        setIsLoading(true);
        const result = await login(pin);
        setIsLoading(false);

        if (result.success) {
            router.replace('/(tabs)/home');
        } else {
            Alert.alert('Failed', result.message || 'Login failed');
            setPin(''); // Clear pin on fail
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900 justify-center p-6">

                {/* Header Logo */}
                <View className="items-center mb-10">
                    <View className="h-24 w-24 bg-blue-600 rounded-full items-center justify-center mb-4 shadow-lg shadow-blue-200 dark:shadow-none">
                        <Ionicons name="storefront" size={40} color="white" />
                    </View>
                    <Text className="text-3xl font-bold text-slate-800 dark:text-white text-center">
                        MyPOS
                    </Text>
                    <Text className="text-slate-500 dark:text-slate-400 mt-2 text-center">
                        Point of Sale System
                    </Text>
                </View>

                <View className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <Text className="text-xl font-bold text-slate-800 dark:text-white mb-6 text-center">
                        {t('welcome_back') || 'Welcome Back'}
                    </Text>

                    {/* Input Section */}
                    <View className="w-full">
                        <Text className="text-slate-700 dark:text-slate-300 font-medium mb-2 ml-1">
                            {t('access_pin') || 'Access PIN'}
                        </Text>

                        <TextInput
                            className={`w-full bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl text-2xl text-center font-bold tracking-[0.5em] border-2 text-slate-800 dark:text-white
                            ${isFocused ? 'border-blue-600' : 'border-gray-200 dark:border-slate-700'}`}
                            value={pin}
                            onChangeText={setPin}
                            placeholder="••••"
                            placeholderTextColor="#94a3b8"
                            keyboardType="numeric"
                            secureTextEntry={true}
                            maxLength={4}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />

                        {/* Login Button */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={isLoading}
                            className={`mt-6 w-full p-4 rounded-2xl flex-row justify-center items-center shadow-md shadow-blue-200 dark:shadow-none
                            ${isLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Ionicons name="log-in-outline" size={24} color="white" style={{ marginRight: 8 }} />
                                    <Text className="text-white font-bold text-lg">
                                        {t('login_btn') || 'Login securely'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Demo Hints */}
                <View className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <Text className="text-blue-800 dark:text-blue-300 font-bold mb-2">Demo Accounts:</Text>
                    <Text className="text-blue-600 dark:text-blue-400 text-xs mb-1">• Admin PIN: <Text className="font-bold">0000</Text> (Full Access)</Text>
                    <Text className="text-blue-600 dark:text-blue-400 text-xs mb-1">• Manager PIN: <Text className="font-bold">1234</Text> (No Delete)</Text>
                    <Text className="text-blue-600 dark:text-blue-400 text-xs">• Cashier PIN: <Text className="font-bold">1111</Text> (POS & History Only)</Text>
                </View>

                <Text className="text-center text-slate-400 mt-auto text-xs">
                    Professional POS System v1.0
                </Text>

            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};