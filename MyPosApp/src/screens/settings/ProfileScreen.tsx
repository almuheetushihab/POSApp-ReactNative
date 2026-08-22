import React, { useState } from 'react';
import { View, Text, Image, Pressable, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';

const settingsGroups = [
  {
    title: 'Account',
    items: [
      { label: 'Edit Profile', icon: 'person-outline', value: 'edit-profile' },
      { label: 'Change Password', icon: 'lock-closed-outline', value: 'change-password' },
      { label: 'Security & 2FA', icon: 'shield-checkmark-outline', value: 'security' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { label: 'Theme Options', icon: 'color-palette-outline', value: 'theme' },
      { label: 'Language', icon: 'language-outline', value: 'language' },
      { label: 'Notifications', icon: 'notifications-outline', value: 'notifications' },
    ],
  },
  {
    title: 'More',
    items: [
      { label: 'Help & Support', icon: 'help-circle-outline', value: 'support' },
      { label: 'Privacy Policy', icon: 'document-text-outline', value: 'privacy' },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, updateProfile, logout } = useAuthStore();
  const { shopInfo } = useSettingsStore();
  const [loading, setLoading] = useState(false);

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

  const handleSettingPress = (value: string) => {
    switch (value) {
      case 'edit-profile':
        router.push('/(tabs)/settings');
        return;
      default:
        Alert.alert('Info', 'This option is coming soon.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
        <Pressable onPress={() => router.back()} className="p-2 rounded-full bg-gray-100">
          <Ionicons name="arrow-back" size={22} color="#475569" />
        </Pressable>
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

            <Text className="mt-5 text-3xl font-bold text-slate-800">{user?.name || 'Unknown User'}</Text>
            <Text className="mt-1 text-sm text-slate-500">{user?.email || 'user@shop.com'}</Text>

            <View className="mt-3 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-200">
              <Text className="text-xs font-bold text-blue-700">{user?.role || 'Cashier'}</Text>
            </View>
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

          <View className="mt-7 space-y-4">
            {settingsGroups.map((group) => (
              <View key={group.title} className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <View className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <Text className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">{group.title}</Text>
                </View>

                {group.items.map((item, index) => (
                  <Pressable
                    key={item.label}
                    onPress={() => handleSettingPress(item.value)}
                    className={`flex-row items-center justify-between px-4 py-4 ${index !== group.items.length - 1 ? 'border-b border-slate-100' : ''}`}
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="h-10 w-10 rounded-xl bg-slate-100 items-center justify-center">
                        <Ionicons name={item.icon as any} size={19} color="#475569" />
                      </View>
                      <Text className="ml-3 text-base font-semibold text-slate-700">{item.label}</Text>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                  </Pressable>
                ))}
              </View>
            ))}
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
