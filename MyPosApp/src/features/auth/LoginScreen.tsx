import React, { useState, useEffect } from 'react';
import {
    View, Text, Alert, TextInput, TouchableOpacity,
    TouchableWithoutFeedback, Keyboard, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { useGoogleSignIn } from '../../services/authService';

const WEB_CLIENT_ID = '1095744732273-0r4d6i5qdrlcvruounpgkmeg14tcrf6d.apps.googleusercontent.com';
const IOS_CLIENT_ID = '1095744732273-n91p6rosl6im05bgaugnt7d3f1as1m90.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = '1095744732273-321qprauptqmokmf6ha58d710qspv2d3.apps.googleusercontent.com';

export const LoginScreen = () => {
    const router = useRouter();
    const { login } = useAuthStore();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { promptAsync, isSigningIn } = useGoogleSignIn(WEB_CLIENT_ID, IOS_CLIENT_ID, ANDROID_CLIENT_ID);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }
        
        setIsLoading(true);
        const result = await login(email, password);
        setIsLoading(false);

        if (!result.success) {
            Alert.alert('Login Failed', result.message || 'Invalid credentials. Please try again.');
        }
        // The redirect is now handled by the root index.tsx file
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
                        <View className="flex-row items-center bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
                            <TextInput
                                className="flex-1 p-4 text-slate-800 dark:text-white font-medium"
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                placeholderTextColor="#94a3b8"
                                secureTextEntry={!isPasswordVisible}
                            />
                            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} className="p-3">
                                <Ionicons name={isPasswordVisible ? "eye-off" : "eye"} size={20} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>
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
                        <TouchableOpacity onPress={() => router.push('/forgotpassword')}>
                            <Text className="text-blue-600 text-xs font-bold">Forgot Password?</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/signup')}>
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
                    onPress={() => promptAsync()}
                    disabled={isSigningIn}
                    className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex-row justify-center items-center border border-gray-200 dark:border-slate-700 shadow-sm"
                >
                    {isSigningIn ? (
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

                {/* Demo Hints */}
                <View className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <Text className="text-blue-800 dark:text-blue-300 font-bold mb-2">For Demo (Password: "password"):</Text>
                    <Text className="text-blue-600 dark:text-blue-400 text-xs mb-1">• Use a real email to sign up or use:</Text>
                    <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold mb-1">  admin@mypos.com</Text>
                </View>

            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};