import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { CustomInput } from '../../src/components/CustomInput';
import { isValidEmail } from '../../src/utils/validation';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{email?: string; password?: string; confirmPassword?: string; form?: string}>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [complete, setComplete] = useState(false);

    const handleSubmit = async () => {
        const nextErrors: typeof errors = {};
        if (!email.trim()) nextErrors.email = 'Email address is required.';
        else if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email address.';
        if (password.length < 8) nextErrors.password = 'Use at least 8 characters.';
        if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        setIsSubmitting(true);
        const result = await resetPassword(email, password);
        setIsSubmitting(false);
        if (!result.success) {
            setErrors({form: result.message || 'Unable to reset password.'});
            return;
        }
        setComplete(true);
    };

    const clearError = (key: keyof typeof errors) => {
        if (errors[key]) setErrors({...errors, [key]: undefined});
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={{flexGrow: 1, padding: 24, paddingBottom: 48}} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <Pressable onPress={() => router.back()} className="mb-10 flex-row items-center">
                        <Ionicons name="arrow-back" size={20} color="#2563eb" />
                        <Text className="ml-2 font-semibold text-blue-600">Back to sign in</Text>
                    </Pressable>
                    <View className="mb-8">
                        <View className="mb-5 h-14 w-14 items-center justify-center rounded-2xl bg-blue-600">
                            <Ionicons name="key-outline" size={28} color="white" />
                        </View>
                        <Text className="text-3xl font-bold text-slate-900">Reset your password</Text>
                        <Text className="mt-2 text-base leading-6 text-slate-500">Enter your account email and choose a new password.</Text>
                    </View>
                    <View className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                        {complete ? (
                            <View className="items-center py-5">
                                <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                                    <Ionicons name="checkmark" size={34} color="#059669" />
                                </View>
                                <Text className="text-center text-xl font-bold text-slate-900">Password updated</Text>
                                <Text className="mt-2 text-center leading-6 text-slate-500">Your password has been changed successfully. You can sign in now.</Text>
                                <Pressable onPress={() => router.replace('/(auth)/login')} className="mt-7 w-full items-center rounded-2xl bg-blue-600 py-4">
                                    <Text className="font-bold text-white">Back to sign in</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <>
                                <CustomInput label="Email address" required error={errors.email} value={email} placeholder="you@yourshop.com"
                                    onChangeText={(value) => {setEmail(value); clearError('email');}} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
                                <CustomInput label="New password" required error={errors.password} value={password} placeholder="At least 8 characters"
                                    onChangeText={(value) => {setPassword(value); clearError('password');}} secureTextEntry={!showPassword} autoCapitalize="none"
                                    rightElement={<Pressable className="px-4" onPress={() => setShowPassword((visible) => !visible)}><Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={21} color="#64748b" /></Pressable>} />
                                <CustomInput label="Confirm password" required error={errors.confirmPassword} value={confirmPassword} placeholder="Repeat your new password"
                                    onChangeText={(value) => {setConfirmPassword(value); clearError('confirmPassword');}} secureTextEntry={!showConfirmPassword} autoCapitalize="none"
                                    rightElement={<Pressable className="px-4" onPress={() => setShowConfirmPassword((visible) => !visible)}><Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={21} color="#64748b" /></Pressable>} />
                                {errors.form ? <Text className="mb-3 text-sm font-medium text-red-600">{errors.form}</Text> : null}
                                <Pressable onPress={handleSubmit} disabled={isSubmitting} className={`items-center rounded-2xl py-4 ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600'}`}>
                                    {isSubmitting ? <ActivityIndicator color="white" /> : <Text className="font-bold text-white">Update password</Text>}
                                </Pressable>
                            </>
                        )}
                    </View>
                    {!complete ? <View className="mt-7 flex-row justify-center"><Text className="text-slate-500">Remember your password? </Text><Link href="/(auth)/login" className="font-bold text-blue-600">Sign in</Link></View> : null}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
