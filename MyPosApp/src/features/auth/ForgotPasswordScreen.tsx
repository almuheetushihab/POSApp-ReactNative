import React, { useState } from 'react';
import { View, Text, Alert, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from '../../store/useAuthStore';

export const ForgotPasswordScreen = () => {
    const router = useRouter();
    const { resetPassword } = useAuthStore();
    
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }
        
        setIsLoading(true);
        const result = await resetPassword(email);
        setIsLoading(false);

        if (result.success) {
            Alert.alert('Check Your Email', 'A link to reset your password has been sent to your email.');
            router.back();
        } else {
            Alert.alert('Error', result.message || 'Failed to send reset link. Please try again.');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900 p-6 justify-center">
            <TouchableOpacity onPress={() => router.back()} className="absolute top-16 left-6 p-2 z-10">
                <Ionicons name="arrow-back-circle" size={32} color="#94a3b8" />
            </TouchableOpacity>

            <View className="items-center mb-10">
                <Text className="text-3xl font-bold text-slate-800 dark:text-white text-center">
                    Forgot Password?
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 mt-2 text-center max-w-xs">
                    No worries! Enter your email and we'll send you a reset link.
                </Text>
            </View>

            <View className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
                <View className="mb-6">
                    <Text className="text-slate-600 dark:text-slate-400 mb-1 font-bold">Email Address</Text>
                    <TextInput
                        className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 font-medium"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="you@example.com"
                        placeholderTextColor="#94a3b8"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity
                    onPress={handleResetPassword}
                    disabled={isLoading}
                    className={`w-full p-4 rounded-2xl flex-row justify-center items-center shadow-md shadow-blue-200 dark:shadow-none
                    ${isLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">
                            Send Reset Link
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};