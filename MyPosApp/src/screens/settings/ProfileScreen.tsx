import React, { useState } from 'react';
import { View, Text, Image, Pressable, Alert, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';

// ProfileScreen: focused on user profile only. Settings moved to SettingsScreen.
export default function ProfileScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { user, updateProfile, logout } = useAuthStore();
    const { shopInfo } = useSettingsStore();
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    const pickImage = async () => {
        try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (perm.status !== 'granted') {
                Alert.alert(t('error') || 'Error', 'Permission to access photos is required');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
                allowsEditing: true,
                aspect: [1, 1],
            });

            if (result.canceled) return;
            const uri = result.assets?.[0]?.uri;
            if (!uri) return;

            setLoading(true);
            updateProfile({ avatar: uri });
            setLoading(false);
            Alert.alert(t('success') || 'Success', t('profile_updated') || 'Profile updated');
        } catch (err) {
            setLoading(false);
            Alert.alert(t('error') || 'Error', 'Could not pick image');
        }
    };

    const handleSave = () => {
        updateProfile({ name, email });
        setEditing(false);
        Alert.alert(t('success') || 'Success', t('profile_updated') || 'Profile updated');
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: () => {
                    logout();
                    router.replace('/');
                },
            },
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
                {router.canGoBack() ? (
                    <Pressable onPress={() => router.back()} className="p-2 rounded-full bg-gray-100">
                        <Ionicons name="arrow-back" size={22} color="#475569" />
                    </Pressable>
                ) : (
                    <View className="w-10 h-10" />
                )}
                <Text className="text-xl font-bold text-slate-800">{t('profile') || 'Profile'}</Text>
                <View className="w-10 h-10" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
                <View className="px-5 pt-6 pb-4">
                    <View className="items-center">
                        <View className="relative">
                            {user?.avatar ? (
                                <Image source={{ uri: user.avatar }} className="h-28 w-28 rounded-full border-4 border-white shadow-lg" />
                            ) : (
                                <View className="h-28 w-28 rounded-full bg-slate-200 items-center justify-center border-4 border-white shadow-lg">
                                    <Ionicons name="person" size={52} color="#64748b" />
                                </View>
                            )}

                            <Pressable
                                onPress={pickImage}
                                className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full bg-blue-600 border-4 border-white items-center justify-center shadow-md"
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Ionicons name="camera" size={18} color="white" />
                                )}
                            </Pressable>
                        </View>

                        {!editing ? (
                            <>
                                <Text className="mt-5 text-3xl font-bold text-slate-800">{user?.name || 'Unknown User'}</Text>
                                <Text className="mt-1 text-sm text-slate-500">{user?.email || 'user@shop.com'}</Text>

                                <View className="mt-3 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-200">
                                    <Text className="text-xs font-bold text-blue-700">{user?.role || 'Cashier'}</Text>
                                </View>

                                <View className="mt-6 flex-row gap-3">
                                    <Pressable onPress={() => setEditing(true)} className="px-4 py-2 bg-blue-600 rounded-lg">
                                        <Text className="text-white font-bold">Edit Profile</Text>
                                    </Pressable>
                                    <Pressable onPress={() => router.push('/(tabs)/settings')} className="px-4 py-2 bg-slate-100 rounded-lg">
                                        <Text className="font-bold">Account Settings</Text>
                                    </Pressable>
                                </View>
                            </>
                        ) : (
                            <View className="w-full mt-4">
                                <Text className="text-sm text-slate-500 mb-2">Name</Text>
                                <TextInput value={name} onChangeText={setName} className="bg-white dark:bg-slate-900 rounded-lg p-3 mb-3 border border-gray-200" />
                                <Text className="text-sm text-slate-500 mb-2">Email</Text>
                                <TextInput value={email} onChangeText={setEmail} className="bg-white dark:bg-slate-900 rounded-lg p-3 mb-4 border border-gray-200" />

                                <View className="flex-row gap-3">
                                    <Pressable onPress={handleSave} className="flex-1 px-4 py-3 bg-emerald-600 rounded-lg items-center">
                                        <Text className="text-white font-bold">Save</Text>
                                    </Pressable>
                                    <Pressable onPress={() => setEditing(false)} className="flex-1 px-4 py-3 bg-gray-100 rounded-lg items-center">
                                        <Text className="font-bold">Cancel</Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}

                    </View>

                    <View className="mt-7 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                        <View className="flex-row justify-between items-center pb-3 border-b border-slate-100">
                            <View className="flex-row items-center">
                                <View className="h-10 w-10 rounded-xl bg-indigo-100 items-center justify-center">
                                    <Ionicons name="storefront-outline" size={20} color="#4f46e5" />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-xs text-slate-400 uppercase tracking-[0.12em]">Branch</Text>
                                    <Text className="text-base font-bold text-slate-800">{shopInfo?.name || 'Main Store'}</Text>
                                </View>
                            </View>
                        </View>

                        <View className="flex-row justify-between items-center pt-3">
                            <View className="flex-row items-center">
                                <View className="h-10 w-10 rounded-xl bg-emerald-100 items-center justify-center">
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#059669" />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-xs text-slate-400 uppercase tracking-[0.12em]">Account Status</Text>
                                    <Text className="text-base font-bold text-emerald-600">Active</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <Pressable
                        onPress={handleLogout}
                        className="mt-8 flex-row items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-4 shadow-sm"
                    >
                        <Ionicons name="log-out-outline" size={20} color="#dc2626" />
                        <Text className="ml-2 text-base font-bold text-red-600">Logout</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
