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

export default function LoginScreen() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim() || !password) {
            Alert.alert('Missing information', 'Enter your email and password to continue.');
            return;
        }

        setIsSubmitting(true);
        const result = await signIn(email, password);
        setIsSubmitting(false);

        if (result.success) {
            router.replace('/(auth)/pin');
        } else {
            Alert.alert('Unable to sign in', result.message ?? 'Check your details and try again.');
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
                        <View className="mb-8 items-center">
                            <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
                                <Ionicons name="storefront-outline" size={32} color="white" />
                            </View>
                            <Text className="text-3xl font-bold text-slate-900">Welcome back</Text>
                            <Text className="mt-2 text-center text-base text-slate-500">
                                Sign in to manage your shop with MyPOS.
                            </Text>
                        </View>

                        <View className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                            <Text className="mb-6 text-xl font-bold text-slate-900">Sign in to your account</Text>

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

                            <View className="flex-row items-center justify-between">
                                <Text className="mb-2 text-sm font-semibold text-slate-700">Password</Text>
                                <Pressable onPress={() => Alert.alert('Coming soon', 'Password recovery will be available soon.')}>
                                    <Text className="mb-2 text-sm font-semibold text-blue-600">Forgot Password?</Text>
                                </Pressable>
                            </View>
                            <TextInput
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900"
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Enter your password"
                                placeholderTextColor="#94a3b8"
                                secureTextEntry
                                autoCapitalize="none"
                                autoComplete="password"
                            />

                            <Pressable
                                className={`mt-7 items-center rounded-2xl py-4 ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600'}`}
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <ActivityIndicator color="white" /> : <Text className="text-base font-bold text-white">Sign In</Text>}
                            </Pressable>
                        </View>

                        <View className="mt-7 flex-row justify-center">
                            <Text className="text-slate-500">New to MyPOS? </Text>
                            <Link href="/(auth)/register" className="font-bold text-blue-600">Create an account</Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
