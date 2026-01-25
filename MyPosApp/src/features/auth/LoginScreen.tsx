import React, {useState} from 'react';
import {View, Text, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MyInput} from '../../components/MyInput';
import {MyButton} from '../../components/MyButton';
import {useRouter} from "expo-router";

export const LoginScreen = () => {
    const router = useRouter();
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = () => {
        if (pin.length !== 4) {
            Alert.alert('Error', 'Please enter a 4-digit PIN');
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            if (pin === '1234') {
                router.replace('/dashboard');
            } else {
                Alert.alert('Failed', 'Wrong PIN Code. Try 1234');
            }
        }, 1500);
    };

    return (
        <SafeAreaView className="flex-1 bg-background justify-center p-6">
            <View className="items-center mb-10">
                <View className="h-24 w-24 bg-primary rounded-full items-center justify-center mb-4 shadow-lg">
                    <Text className="text-white text-3xl font-bold">POS</Text>
                </View>
                <Text className="text-3xl font-bold text-slate-800">Welcome Back</Text>
                <Text className="text-slate-500 mt-2">Enter your employee PIN to continue</Text>
            </View>

            <View>
                <MyInput
                    label="Access PIN"
                    value={pin}
                    onChangeText={setPin}
                    placeholder="Enter 4-digit PIN"
                    keyboardType="numeric"
                    secureTextEntry={true}
                />

                <View className="mt-6">
                    <MyButton
                        title="Login to System"
                        onPress={handleLogin}
                        isLoading={isLoading}
                    />
                </View>
            </View>

            <Text className="text-center text-slate-400 mt-10 text-xs">
                Professional POS System v1.0
            </Text>
        </SafeAreaView>
    );
};