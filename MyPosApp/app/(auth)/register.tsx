import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { CustomInput } from '../../src/components/CustomInput';
import { isValidEmail } from '../../src/utils/validation';

export default function RegisterScreen() {
    const router = useRouter();
    const { signUp } = useAuth();
    const [shopName, setShopName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ shopName?: string; email?: string; password?: string }>({});

    const handleSubmit = async () => {
        const nextErrors: typeof errors = {};
        if (!shopName.trim()) nextErrors.shopName = 'Shop name is required.';
        else if (shopName.trim().length < 2) nextErrors.shopName = 'Enter at least 2 characters.';
        if (!email.trim()) nextErrors.email = 'Email address is required.';
        else if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email address.';
        if (password.length < 8) nextErrors.password = 'Use at least 8 characters.';
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
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

                            <CustomInput
                                label="Business / Shop name"
                                required
                                error={errors.shopName}
                                value={shopName}
                                onChangeText={(value) => { setShopName(value); if (errors.shopName) setErrors({...errors, shopName: undefined}); }}
                                placeholder="Your shop name"
                                placeholderTextColor="#94a3b8"
                                autoCapitalize="words"
                            />

                            <CustomInput
                                label="Email address"
                                required
                                error={errors.email}
                                value={email}
                                onChangeText={(value) => { setEmail(value); if (errors.email) setErrors({...errors, email: undefined}); }}
                                placeholder="you@yourshop.com"
                                placeholderTextColor="#94a3b8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />

                            <CustomInput
                                label="Password"
                                required
                                error={errors.password}
                                value={password}
                                onChangeText={(value) => { setPassword(value); if (errors.password) setErrors({...errors, password: undefined}); }}
                                placeholder="At least 8 characters"
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
