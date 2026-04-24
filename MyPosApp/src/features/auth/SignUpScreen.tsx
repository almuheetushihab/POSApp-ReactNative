import React, { useState } from 'react';
import {
    View, Text, Alert, TextInput, TouchableOpacity,
    TouchableWithoutFeedback, Keyboard, ActivityIndicator, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from '../../store/useAuthStore';
import { UserRole } from '../../types/user';

export const SignUpScreen = () => {
    const router = useRouter();
    const { signUp } = useAuthStore();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('Cashier'); // Default role selection
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        
        setIsLoading(true);
        // Pass the selected role to the signUp function
        const result = await signUp(name, email, password, role);
        setIsLoading(false);

        if (result.success) {
            router.back();
            Alert.alert(
                'Request Sent', 
                'Your account request has been sent. You will be able to log in once an admin approves it.'
            );
        } else {
            Alert.alert('Sign Up Failed', result.message || 'Could not create account. Please try again.');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900 p-6">
                <ScrollView showsVerticalScrollIndicator={false}>
                    <TouchableOpacity onPress={() => router.back()} className="absolute top-0 left-0 p-2 z-10">
                        <Ionicons name="arrow-back-circle" size={32} color="#94a3b8" />
                    </TouchableOpacity>

                    <View className="items-center my-10">
                        <Text className="text-3xl font-bold text-slate-800 dark:text-white text-center">
                            Create Account
                        </Text>
                        <Text className="text-slate-500 dark:text-slate-400 mt-2 text-center">
                            Request access by filling out the form
                        </Text>
                    </View>

                    <View className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
                        
                        <View className="mb-4">
                            <Text className="text-slate-600 dark:text-slate-400 mb-1 font-bold">Full Name</Text>
                            <TextInput
                                className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 font-medium"
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your full name"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

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

                        <View className="mb-4">
                            <Text className="text-slate-600 dark:text-slate-400 mb-1 font-bold">Password</Text>
                            <View className="flex-row items-center bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
                                <TextInput
                                    className="flex-1 p-4 text-slate-800 dark:text-white font-medium"
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Minimum 6 characters"
                                    placeholderTextColor="#94a3b8"
                                    secureTextEntry={!isPasswordVisible}
                                />
                                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} className="p-3">
                                    <Ionicons name={isPasswordVisible ? "eye-off" : "eye"} size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Role Selection */}
                        <View className="mb-6">
                            <Text className="text-slate-600 dark:text-slate-400 mb-2 font-bold">Select Role</Text>
                            <View className="flex-row justify-around">
                                <RoleSelectorButton
                                    label="Cashier"
                                    selectedRole={role}
                                    onPress={() => setRole('Cashier')}
                                />
                                <RoleSelectorButton
                                    label="Manager"
                                    selectedRole={role}
                                    onPress={() => setRole('Manager')}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleSignUp}
                            disabled={isLoading}
                            className={`w-full p-4 rounded-2xl flex-row justify-center items-center shadow-md shadow-blue-200 dark:shadow-none
                            ${isLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">
                                    Send Request
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

const RoleSelectorButton = ({ label, selectedRole, onPress }: { label: UserRole, selectedRole: UserRole, onPress: () => void }) => {
    const isSelected = label === selectedRole;
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`w-[48%] py-3 rounded-xl border-2 ${
                isSelected
                    ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-500'
                    : 'bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700'
            }`}
        >
            <Text className={`font-bold text-center ${
                isSelected ? 'text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'
            }`}>{label}</Text>
        </TouchableOpacity>
    );
};