import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';

export default function PinScreen() {
    const router = useRouter();
    const { activeRole, signInWithPin, signOut } = useAuth();
    const [pin, setPin] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!/^\d{4}$/.test(pin)) {
            Alert.alert('Invalid PIN', 'Enter your 4-digit staff PIN to continue.');
            return;
        }

        setIsSubmitting(true);
        const result = await signInWithPin(pin);
        setIsSubmitting(false);

        if (result.success) {
            router.replace('/(tabs)/home');
        } else {
            setPin('');
            Alert.alert('Unable to unlock', result.message ?? 'Enter a valid staff PIN.');
        }
    };

    const handleSignOut = () => {
        signOut();
        router.replace('/(auth)/login');
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <KeyboardAvoidingView
                className="flex-1 justify-center px-6"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View className="items-center">
                    <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
                        <Ionicons name="lock-closed-outline" size={32} color="white" />
                    </View>
                    <Text className="text-3xl font-bold text-slate-900">Who is using the POS?</Text>
                    <Text className="mt-2 text-center text-base text-slate-500">
                        Enter your staff PIN to unlock your role.
                    </Text>
                </View>

                <View className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    <Text className="mb-2 text-sm font-semibold text-slate-700">Staff PIN</Text>
                    <TextInput
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-2xl tracking-[0.5em] text-slate-900"
                        value={pin}
                        onChangeText={(value) => setPin(value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="••••"
                        placeholderTextColor="#94a3b8"
                        keyboardType="number-pad"
                        secureTextEntry
                        maxLength={4}
                        autoFocus
                        onSubmitEditing={handleSubmit}
                    />

                    <Pressable
                        className={`mt-7 items-center rounded-2xl py-4 ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600'}`}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-base font-bold text-white">Unlock POS</Text>
                        )}
                    </Pressable>

                    {activeRole ? (
                        <Text className="mt-4 text-center text-sm text-slate-500">
                            Active role: {activeRole}
                        </Text>
                    ) : null}
                </View>

                <Pressable onPress={handleSignOut} className="mt-7 items-center py-3">
                    <Text className="font-semibold text-slate-500">Sign in with a different account</Text>
                </Pressable>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
