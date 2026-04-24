import React, { useState } from 'react';
import {
    View, Text, Alert, TextInput, TouchableOpacity,
    TouchableWithoutFeedback, Keyboard, ActivityIndicator, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { useTranslation } from 'react-i18next';
import { useAuthStore } from "../../store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";

// In a real app, you'd get these from your Google Cloud Console
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

export const LoginScreen = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { login, loginWithGoogle } = useAuthStore();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }
        
        setIsLoading(true);
        // This is a mock login. In a real app, you'd call a backend endpoint.
        const result = await login(email, password);
        setIsLoading(false);

        if (result.success) {
            router.replace('/(tabs)/home');
        } else {
            Alert.alert('Login Failed', result.message || 'Invalid credentials. Please try again.');
        }
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        // This will be implemented with expo-auth-session in the next step
        // For now, we simulate a successful login
        const result = await loginWithGoogle();
        setIsGoogleLoading(false);
        
        if (result.success) {
            router.replace('/(tabs)/home');
        } else {
            Alert.alert('Google Sign-In Failed', result.message || 'Could not sign in with Google.');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950 justify-center p-6">

                <View className="items-center mb-10">
                    <View className="h-24 w-24 bg-blue-600 rounded-full items-center justify-center mb-4 shadow-lg shadow-blue-200 dark:shadow-none">
                        <Ionicons name="storefront" size={40} color="white" />
                    </View>
                    <Text className="text-3xl font-bold text-slate-800 dark:text-white text-center">
                        Welcome to MyPOS
                    </Text>
                    <Text className="text-slate-500 dark:text-slate-400 mt-2 text-center">
                        Sign in to continue
                    </Text>
                </View>

                <View className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
                    
                    <View className="mb-4">
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

                    <View className="mb-6">
                        <Text className="text-slate-600 dark:text-slate-400 mb-1 font-bold">Password</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 font-medium"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            placeholderTextColor="#94a3b8"
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={isLoading}
                        className={`w-full p-4 rounded-2xl flex-row justify-center items-center shadow-md shadow-blue-200 dark:shadow-none
                        ${isLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">
                                Sign In
                            </Text>
                        )}
                    </TouchableOpacity>
                    
                    <View className="flex-row justify-between mt-4">
                        <TouchableOpacity>
                            <Text className="text-blue-600 text-xs font-bold">Forgot Password?</Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Text className="text-slate-500 text-xs font-bold">Create Account</Text>
                        </TouchableOpacity>
                    </View>

                </View>

                <View className="flex-row items-center my-8">
                    <View className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                    <Text className="mx-4 text-slate-500 text-xs">OR</Text>
                    <View className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                </View>

                <TouchableOpacity
                    onPress={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex-row justify-center items-center border border-gray-200 dark:border-slate-700 shadow-sm"
                >
                    {isGoogleLoading ? (
                        <ActivityIndicator />
                    ) : (
                        <>
                            <Ionicons name="logo-google" size={20} color="#ef4444" style={{ marginRight: 12 }} />
                            <Text className="text-slate-800 dark:text-white font-bold text-base">
                                Sign In with Google
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text className="text-center text-slate-400 mt-auto text-xs">
                    Professional POS System v1.0
                </Text>

            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};