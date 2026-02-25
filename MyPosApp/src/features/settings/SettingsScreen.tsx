import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, ScrollView, Switch, TextInput, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {useTranslation} from 'react-i18next';
import {useColorScheme} from 'nativewind';
import {useAppStore} from "../../store/useAppStore";
import {useSettingsStore} from "../../store/useSettingsStore";

export default function SettingsScreen() {
    const router = useRouter();
    const {t, i18n} = useTranslation();
    const {colorScheme, toggleColorScheme} = useColorScheme();

    const {theme, setTheme, language, setLanguage} = useAppStore();

    const {shopInfo, updateShopInfo} = useSettingsStore();

    const [formData, setFormData] = useState(shopInfo);

    useEffect(() => {
        setFormData(shopInfo);
    }, [shopInfo]);

    const handleLanguageChange = async (value: boolean) => {
        const newLang = value ? 'bn' : 'en';

        setLanguage(newLang);

        await i18n.changeLanguage(newLang);
    };

    const handleThemeChange = (value: boolean) => {
        const newTheme = value ? 'dark' : 'light';

        setTheme(newTheme);
        if (colorScheme !== newTheme) {
            toggleColorScheme();
        }
    };

    const handleSaveShopInfo = () => {
        updateShopInfo(formData);
        Alert.alert("Success", "Shop information updated successfully!");
    };

    const handleLogout = () => {
        router.replace('/');
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            {/* Header */}
            <View className="p-5 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <Text className="text-2xl font-bold text-slate-800 dark:text-white">
                    {t('settings')}
                </Text>
            </View>

            <ScrollView className="p-5">

                {/* Shop Configuration Section */}
                <Text className="text-slate-500 dark:text-slate-400 font-semibold mb-3 uppercase text-xs">
                    Shop Configuration
                </Text>

                <View
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 mb-6 shadow-sm border border-gray-100 dark:border-slate-800">

                    {/* Shop Name */}
                    <View className="mb-4">
                        <Text className="text-slate-500 mb-1 text-xs font-bold uppercase">Shop Name</Text>
                        <TextInput
                            className="bg-gray-100 dark:bg-slate-800 p-3 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700"
                            value={formData.name}
                            onChangeText={(text) => setFormData({...formData, name: text})}
                            placeholder="Enter Shop Name"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    {/* Address */}
                    <View className="mb-4">
                        <Text className="text-slate-500 mb-1 text-xs font-bold uppercase">Address</Text>
                        <TextInput
                            className="bg-gray-100 dark:bg-slate-800 p-3 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700"
                            value={formData.address}
                            onChangeText={(text) => setFormData({...formData, address: text})}
                            placeholder="Enter Address"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    {/* Phone */}
                    <View className="mb-4">
                        <Text className="text-slate-500 mb-1 text-xs font-bold uppercase">Phone</Text>
                        <TextInput
                            className="bg-gray-100 dark:bg-slate-800 p-3 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700"
                            value={formData.phone}
                            onChangeText={(text) => setFormData({...formData, phone: text})}
                            keyboardType="phone-pad"
                            placeholder="Enter Phone Number"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    {/* Footer Message */}
                    <View className="mb-4">
                        <Text className="text-slate-500 mb-1 text-xs font-bold uppercase">Receipt Footer</Text>
                        <TextInput
                            className="bg-gray-100 dark:bg-slate-800 p-3 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700"
                            value={formData.footerMessage}
                            onChangeText={(text) => setFormData({...formData, footerMessage: text})}
                            placeholder="Thank you message..."
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleSaveShopInfo}
                        className="bg-blue-600 p-4 rounded-xl items-center active:opacity-80"
                    >
                        <Text className="text-white font-bold text-base">Save Shop Info</Text>
                    </TouchableOpacity>
                </View>


                {/* Preferences Section */}
                <Text className="text-slate-500 dark:text-slate-400 font-semibold mb-3 uppercase text-xs">
                    {t('preferences')}
                </Text>

                <View
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-6 shadow-sm border border-gray-100 dark:border-slate-800">

                    {/* Language Switch */}
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-row items-center gap-3">
                            <View className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                <Ionicons name="language" size={20} color="#2563eb"/>
                            </View>
                            <Text className="text-lg font-medium text-slate-700 dark:text-slate-200">
                                {t('language')} ({language === 'bn' ? 'বাংলা' : 'English'})
                            </Text>
                        </View>
                        {/* 🔥 Updated Switch Logic */}
                        <Switch
                            value={language === 'bn'}
                            onValueChange={handleLanguageChange}
                            trackColor={{false: '#e2e8f0', true: '#93c5fd'}}
                            thumbColor={language === 'bn' ? '#2563eb' : '#f4f4f5'}
                        />
                    </View>

                    {/* Theme Switch */}
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center gap-3">
                            <View className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                                <Ionicons name="moon" size={20} color={theme === 'dark' ? '#f59e0b' : '#475569'}/>
                            </View>
                            <Text className="text-lg font-medium text-slate-700 dark:text-slate-200">
                                {t('dark_mode')}
                            </Text>
                        </View>
                        {/* 🔥 Updated Switch Logic */}
                        <Switch
                            value={theme === 'dark'}
                            onValueChange={handleThemeChange}
                            trackColor={{false: '#e2e8f0', true: '#334155'}}
                        />
                    </View>
                </View>

                {/* Support Section */}
                <Text className="text-slate-500 dark:text-slate-400 font-semibold mb-3 uppercase text-xs">
                    {t('support')}
                </Text>

                <View
                    className="bg-white dark:bg-slate-900 rounded-2xl p-2 mb-6 shadow-sm border border-gray-100 dark:border-slate-800">
                    <SettingsLink label="privacy"/>
                    <SettingsLink label="terms" last/>
                </View>

                {/* Logout */}
                <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl flex-row justify-center items-center gap-2 mt-4 mb-10"
                >
                    <Ionicons name="log-out-outline" size={20} color="#ef4444"/>
                    <Text className="text-red-500 font-bold text-lg">{t('logout')}</Text>
                </TouchableOpacity>

                <Text className="text-center text-slate-400 mb-10 text-sm">
                    {t('version')} 1.0.0
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const SettingsLink = ({label, last}: any) => {
    const {t} = useTranslation();
    return (
        <TouchableOpacity
            className={`flex-row items-center justify-between p-3 ${!last ? 'border-b border-gray-100 dark:border-slate-800' : ''}`}>
            <Text className="text-slate-700 dark:text-slate-200 font-medium">{t(label)}</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8"/>
        </TouchableOpacity>
    );
};