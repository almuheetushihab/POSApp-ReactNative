import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';

export default function RegisterScreen() {
    const router = useRouter();
    const { signUp } = useAuth();
    const [shopName, setShopName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!shopName.trim() || !email.trim() || password.length < 6) {
            Alert.alert('Check your details', 'Enter all fields and use a password with at least 6 characters.');
            return;
        }

        setIsSubmitting(true);
        const result = await signUp(shopName, email, password);
        setIsSubmitting(false);

        if (result.success) {
            router.replace('/(auth)/pin');
        } else {
            Alert.alert('Unable to create account', result.message ?? 'Please try again.');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="flex-1 justify-center px-6 py-10">
                        <Pressable onPress={() => router.back()} className="mb-7 flex-row items-center">
                            <Ionicons name="arrow-back" size={20} color="#2563eb" />
                            <Text className="ml-2 font-semibold text-blue-600">Back to sign in</Text>
                        </Pressable>

                        <View className="mb-8">
                            <Text className="text-3xl font-bold text-slate-900">Create your account</Text>
                            <Text className="mt-2 text-base text-slate-500">
                                Set up your shop and start selling in minutes.
                            </Text>
                        </View>

                        <View className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                            <Text className="mb-6 text-xl font-bold text-slate-900">Shop details</Text>

                            <Text className="mb-2 text-sm font-semibold text-slate-700">Business / Shop name</Text>
                            <TextInput
                                className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900"
                                value={shopName}
                                onChangeText={setShopName}
                                placeholder="Your shop name"
                                placeholderTextColor="#94a3b8"
                                autoCapitalize="words"
                            />

                            <Text className="mb-2 text-sm font-semibold text-slate-700">Email address</Text>
                            <TextInput
                                className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900"
                                value={email}
                                onChangeText={setEmail}
                                placeholder="you@yourshop.com"
                                placeholderTextColor="#94a3b8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />

                            <Text className="mb-2 text-sm font-semibold text-slate-700">Password</Text>
                            <TextInput
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900"
                                value={password}
                                onChangeText={setPassword}
                                placeholder="At least 6 characters"
                                placeholderTextColor="#94a3b8"
                                secureTextEntry
                                autoCapitalize="none"
                                autoComplete="new-password"
                            />

                            <Pressable
                                className={`mt-7 items-center rounded-2xl py-4 ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600'}`}
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <ActivityIndicator color="white" /> : <Text className="text-base font-bold text-white">Create Account</Text>}
                            </Pressable>
                        </View>

                        <View className="mt-7 flex-row justify-center">
                            <Text className="text-slate-500">Already have an account? </Text>
                            <Link href="/(auth)/login" className="font-bold text-blue-600">Sign in</Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
