import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, ScrollView, Switch, TextInput, Alert, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {useTranslation} from 'react-i18next';
import {useColorScheme} from 'nativewind';
import {useAppStore} from "../../store/useAppStore";
import {useSettingsStore, TaxSettings} from "../../store/useSettingsStore";
import {useAuthStore} from "../../store/useAuthStore";
import {useOrderStore} from "../../store/useOrderStore";
import {useCustomerStore} from "../../store/useCustomerStore";

export default function SettingsScreen() {
    const router = useRouter();
    const {t, i18n} = useTranslation();
    const {colorScheme, toggleColorScheme} = useColorScheme();

    const {theme, setTheme, language, setLanguage} = useAppStore();
    const {shopInfo, updateShopInfo, taxSettings, updateTaxSettings} = useSettingsStore();
    const {logout} = useAuthStore();
    
    // Sync states
    const {unsyncedOrders, retryFailedSyncs: retryOrderSync, pullCloudUpdates} = useOrderStore();
    const {unsyncedCustomers, retryFailedSyncs: retryCustomerSync} = useCustomerStore();
    const [isSyncing, setIsSyncing] = useState(false);

    const [formData, setFormData] = useState(shopInfo);
    const [taxData, setTaxData] = useState<TaxSettings>(taxSettings);

    useEffect(() => {
        setFormData(shopInfo);
        setTaxData(taxSettings);
    }, [shopInfo, taxSettings]);

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

    const handleSaveTaxSettings = () => {
        const rate = parseFloat(taxData.taxRate.toString());
        if (taxData.isEnabled && (isNaN(rate) || rate < 0)) {
            Alert.alert("Error", "Please enter a valid tax rate.");
            return;
        }

        updateTaxSettings({
            ...taxData,
            taxRate: isNaN(rate) ? 0 : rate
        });
        Alert.alert("Success", "Tax & VAT settings updated successfully!");
    };
    
    const handleManualSync = async () => {
        setIsSyncing(true);
        try {
            // Push local failed/unsynced data
            await retryOrderSync();
            await retryCustomerSync();
            
            // Pull any cloud updates from other devices/cashiers
            await pullCloudUpdates();
            
            Alert.alert("Sync Complete", "Cloud synchronization finished successfully.");
        } catch (error) {
            Alert.alert("Sync Error", "Something went wrong during synchronization. Please check your internet connection.");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.replace('/');
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            {/* Header */}
            <View className="flex-row items-center p-5 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="#64748b" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-slate-800 dark:text-white">
                    {t('settings') || 'Settings'}
                </Text>
            </View>

            <ScrollView className="p-5" showsVerticalScrollIndicator={false}>

                {/* Cloud Sync Section */}
                <Text className="text-slate-500 dark:text-slate-400 font-bold mb-3 uppercase text-xs tracking-widest">
                    Cloud Synchronization
                </Text>

                <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-6 shadow-sm border border-gray-100 dark:border-slate-800">
                    <View className="flex-row items-center gap-3 mb-4">
                        <View className="bg-emerald-50 dark:bg-emerald-900/20 p-2.5 rounded-full">
                            <Ionicons name="cloud-done-outline" size={24} color="#10b981" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-slate-800 dark:text-white text-base">Backend Sync</Text>
                            <Text className="text-slate-500 text-xs mt-0.5">
                                Pending Uploads: {unsyncedOrders.length} Orders, {unsyncedCustomers.length} Customers
                            </Text>
                        </View>
                    </View>
                    
                    <Text className="text-slate-500 text-xs mb-4 leading-5">
                        Your app automatically syncs in the background. If you were offline, or want to pull updates from other devices, press sync.
                    </Text>

                    <TouchableOpacity
                        onPress={handleManualSync}
                        disabled={isSyncing}
                        className={`${isSyncing ? 'bg-slate-300 dark:bg-slate-800' : 'bg-emerald-600'} p-4 rounded-xl items-center active:bg-emerald-700 flex-row justify-center gap-2`}
                    >
                        {isSyncing ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="sync" size={20} color="white" />
                        )}
                        <Text className={`${isSyncing ? 'text-slate-500 dark:text-slate-400' : 'text-white'} font-bold text-base`}>
                            {isSyncing ? 'Syncing with Cloud...' : 'Sync Now'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Shop Configuration Section */}
                <Text className="text-slate-500 dark:text-slate-400 font-bold mb-3 uppercase text-xs tracking-widest">
                    Shop Configuration
                </Text>

                <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-6 shadow-sm border border-gray-100 dark:border-slate-800">
                    <View className="mb-4">
                        <Text className="text-slate-600 dark:text-slate-400 mb-1 text-xs font-bold uppercase">Shop Name</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 font-medium"
                            value={formData.name}
                            onChangeText={(text) => setFormData({...formData, name: text})}
                            placeholder="Enter Shop Name"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-slate-600 dark:text-slate-400 mb-1 text-xs font-bold uppercase">Address</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 font-medium"
                            value={formData.address}
                            onChangeText={(text) => setFormData({...formData, address: text})}
                            placeholder="Enter Address"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-slate-600 dark:text-slate-400 mb-1 text-xs font-bold uppercase">Phone</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 font-medium"
                            value={formData.phone}
                            onChangeText={(text) => setFormData({...formData, phone: text})}
                            keyboardType="phone-pad"
                            placeholder="Enter Phone Number"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <View className="mb-6">
                        <Text className="text-slate-600 dark:text-slate-400 mb-1 text-xs font-bold uppercase">Receipt Footer Message</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 font-medium"
                            value={formData.footerMessage}
                            onChangeText={(text) => setFormData({...formData, footerMessage: text})}
                            placeholder="Thank you message..."
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleSaveShopInfo}
                        className="bg-blue-600 p-4 rounded-xl items-center active:bg-blue-700 flex-row justify-center gap-2"
                    >
                        <Ionicons name="save-outline" size={20} color="white" />
                        <Text className="text-white font-bold text-base">Save Shop Info</Text>
                    </TouchableOpacity>
                </View>


                {/* TAX & VAT CONFIGURATION SECTION */}
                <Text className="text-slate-500 dark:text-slate-400 font-bold mb-3 uppercase text-xs tracking-widest mt-2">
                    Tax & VAT Configuration
                </Text>

                <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-6 shadow-sm border border-gray-100 dark:border-slate-800">
                    
                    <View className="flex-row justify-between items-center mb-6 bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-slate-700">
                        <View className="flex-row items-center gap-3">
                            <View className={`p-2 rounded-full ${taxData.isEnabled ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-gray-200 dark:bg-slate-700'}`}>
                                <Ionicons name="receipt-outline" size={20} color={taxData.isEnabled ? '#4f46e5' : '#64748b'}/>
                            </View>
                            <View>
                                <Text className="text-base font-bold text-slate-800 dark:text-white">Enable Tax System</Text>
                                <Text className="text-xs text-slate-500">Apply tax on POS sales</Text>
                            </View>
                        </View>
                        <Switch
                            value={taxData.isEnabled}
                            onValueChange={(val) => setTaxData({...taxData, isEnabled: val})}
                            trackColor={{false: '#e2e8f0', true: '#a5b4fc'}}
                            thumbColor={taxData.isEnabled ? '#4f46e5' : '#f4f4f5'}
                        />
                    </View>

                    {taxData.isEnabled && (
                        <>
                            <View className="flex-row gap-3 mb-4">
                                <View className="flex-[2]">
                                    <Text className="text-slate-600 dark:text-slate-400 mb-1 text-xs font-bold uppercase">Tax Name</Text>
                                    <TextInput
                                        className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 font-bold"
                                        value={taxData.taxName}
                                        onChangeText={(text) => setTaxData({...taxData, taxName: text})}
                                        placeholder="e.g. VAT, GST"
                                        placeholderTextColor="#94a3b8"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-600 dark:text-slate-400 mb-1 text-xs font-bold uppercase">Rate (%)</Text>
                                    <TextInput
                                        className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 font-bold text-center"
                                        value={taxData.taxRate.toString()}
                                        onChangeText={(text) => setTaxData({...taxData, taxRate: text as any})}
                                        keyboardType="numeric"
                                        placeholder="5"
                                        placeholderTextColor="#94a3b8"
                                    />
                                </View>
                            </View>

                            <View className="mb-6">
                                <Text className="text-slate-600 dark:text-slate-400 mb-2 text-xs font-bold uppercase">Tax Calculation Method</Text>
                                <View className="flex-row bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                                    <TouchableOpacity 
                                        onPress={() => setTaxData({...taxData, isInclusive: true})}
                                        className={`flex-1 py-3 items-center rounded-lg ${taxData.isInclusive ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                                    >
                                        <Text className={`font-bold ${taxData.isInclusive ? 'text-indigo-600 dark:text-white' : 'text-slate-500'}`}>Inclusive</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => setTaxData({...taxData, isInclusive: false})}
                                        className={`flex-1 py-3 items-center rounded-lg ${!taxData.isInclusive ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                                    >
                                        <Text className={`font-bold ${!taxData.isInclusive ? 'text-indigo-600 dark:text-white' : 'text-slate-500'}`}>Exclusive</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text className="text-slate-500 dark:text-slate-400 text-[10px] mt-2 text-center">
                                    {taxData.isInclusive 
                                        ? "Tax is already included in the item's price (Total doesn't increase)." 
                                        : "Tax is added on top of the subtotal (Total increases)."}
                                </Text>
                            </View>
                        </>
                    )}

                    <TouchableOpacity
                        onPress={handleSaveTaxSettings}
                        className="bg-indigo-600 p-4 rounded-xl items-center active:bg-indigo-700 flex-row justify-center gap-2"
                    >
                        <Ionicons name="calculator-outline" size={20} color="white" />
                        <Text className="text-white font-bold text-base">Save Tax Settings</Text>
                    </TouchableOpacity>
                </View>

                {/* Preferences Section */}
                <Text className="text-slate-500 dark:text-slate-400 font-bold mb-3 uppercase text-xs tracking-widest mt-2">
                    {t('preferences') || 'Preferences'}
                </Text>

                <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-6 shadow-sm border border-gray-100 dark:border-slate-800">

                    {/* Language Switch */}
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-row items-center gap-3">
                            <View className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-full">
                                <Ionicons name="language" size={20} color="#2563eb"/>
                            </View>
                            <Text className="text-base font-bold text-slate-800 dark:text-white">
                                {t('language')} ({language === 'bn' ? 'বাংলা' : 'English'})
                            </Text>
                        </View>
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
                            <View className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-full">
                                <Ionicons name="moon" size={20} color={theme === 'dark' ? '#f59e0b' : '#64748b'}/>
                            </View>
                            <Text className="text-base font-bold text-slate-800 dark:text-white">
                                {t('dark_mode') || 'Dark Mode'}
                            </Text>
                        </View>
                        <Switch
                            value={theme === 'dark'}
                            onValueChange={handleThemeChange}
                            trackColor={{false: '#e2e8f0', true: '#334155'}}
                            thumbColor={theme === 'dark' ? '#f59e0b' : '#f4f4f5'}
                        />
                    </View>
                </View>

                {/* Support Section */}
                <Text className="text-slate-500 dark:text-slate-400 font-bold mb-3 uppercase text-xs tracking-widest mt-2">
                    {t('support') || 'Support & Legal'}
                </Text>

                <View className="bg-white dark:bg-slate-900 rounded-3xl p-2 mb-6 shadow-sm border border-gray-100 dark:border-slate-800">
                    <SettingsLink icon="shield-checkmark-outline" label="privacy" />
                    <SettingsLink icon="document-text-outline" label="terms" last />
                </View>

                {/* Logout */}
                <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl flex-row justify-center items-center gap-2 mt-2 mb-10 border border-red-100 dark:border-red-900/20"
                >
                    <Ionicons name="log-out-outline" size={20} color="#ef4444"/>
                    <Text className="text-red-500 font-bold text-lg">{t('logout') || 'Logout Securely'}</Text>
                </TouchableOpacity>

                <Text className="text-center text-slate-400 mb-10 text-xs font-bold tracking-widest uppercase">
                    MyPOS Version 1.0.0
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const SettingsLink = ({label, icon, last}: any) => {
    const {t} = useTranslation();
    return (
        <TouchableOpacity className={`flex-row items-center justify-between p-4 ${!last ? 'border-b border-gray-50 dark:border-slate-800' : ''}`}>
            <View className="flex-row items-center gap-3">
                <Ionicons name={icon} size={20} color="#64748b" />
                <Text className="text-slate-700 dark:text-slate-200 font-bold">{t(label) || label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1"/>
        </TouchableOpacity>
    );
};