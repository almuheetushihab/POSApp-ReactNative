import React, { useState } from 'react';
import {
    View, Text, Alert, TextInput, TouchableOpacity,
    TouchableWithoutFeedback, Keyboard, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { useTranslation } from 'react-i18next';

export const LoginScreen = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false); // ফোকাস স্টেট

    const handleLogin = () => {
        if (pin.length !== 4) {
            Alert.alert('Error', 'Please enter a 4-digit PIN');
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            if (pin === '1234') {
                router.replace('/(tabs)/home');
            } else {
                Alert.alert('Failed', 'Wrong PIN Code. Try 1234');
            }
        }, 1500);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900 justify-center p-6">

                {/* Header Logo */}
                <View className="items-center mb-10">
                    <View className="h-24 w-24 bg-blue-600 rounded-full items-center justify-center mb-4 shadow-lg shadow-blue-200 dark:shadow-none">
                        <Text className="text-white text-3xl font-bold">POS</Text>
                    </View>
                    <Text className="text-3xl font-bold text-slate-800 dark:text-white">
                        {t('welcome_back')}
                    </Text>
                    <Text className="text-slate-500 dark:text-slate-400 mt-2">
                        {t('enter_pin')}
                    </Text>
                </View>

                {/* Input Section */}
                <View className="w-full">
                    <Text className="text-slate-700 dark:text-slate-300 font-medium mb-2 ml-1">
                        {t('access_pin')}
                    </Text>

                    <TextInput
                        className={`w-full bg-white dark:bg-slate-800 p-4 rounded-xl text-xl text-center font-bold tracking-widest border-2 text-slate-800 dark:text-white
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
                        className={`mt-6 w-full p-4 rounded-xl flex-row justify-center items-center shadow-md shadow-blue-200 dark:shadow-none
                        ${isLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">
                                {t('login_btn')}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                <Text className="text-center text-slate-400 mt-10 text-xs">
                    Professional POS System v1.0
                </Text>

            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};