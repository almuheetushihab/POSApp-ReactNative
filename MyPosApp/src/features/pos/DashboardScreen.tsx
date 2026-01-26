import React from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRouter} from "expo-router";
import {t} from "i18next";
import {useTranslation} from "react-i18next";
import {Ionicons} from "@expo/vector-icons";

export const DashboardScreen = () => {
    const router = useRouter();

    const handleLogout = () => {
        router.replace('/');
    };
    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            <ScrollView contentContainerStyle={{padding: 20}}>

                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-2xl font-bold text-slate-800 dark:text-white">
                            {t('dashboard')}
                        </Text>
                        <Text className="text-slate-500 dark:text-slate-400">
                            {t('overview')}
                        </Text>
                    </View>
                    <View
                        className="h-10 w-10 bg-gray-200 dark:bg-slate-800 rounded-full items-center justify-center border border-gray-300 dark:border-slate-700">
                        <Text className="font-bold text-slate-700 dark:text-white">A</Text>
                    </View>
                </View>

                {/* Stats Cards */}
                <View className="flex-row flex-wrap justify-between mb-6">
                    <View className="bg-blue-600 w-[48%] p-4 rounded-2xl mb-4 shadow-sm">
                        <Text className="text-blue-100 text-sm font-medium">{t('total_sales')}</Text>
                        <Text className="text-white text-2xl font-bold mt-1">৳ 15,200</Text>
                    </View>
                    <View className="bg-orange-500 w-[48%] p-4 rounded-2xl mb-4 shadow-sm">
                        <Text className="text-orange-100 text-sm font-medium">{t('total_orders')}</Text>
                        <Text className="text-white text-2xl font-bold mt-1">24</Text>
                    </View>
                    <View className="bg-emerald-500 w-[48%] p-4 rounded-2xl mb-4 shadow-sm">
                        <Text className="text-emerald-100 text-sm font-medium">{t('customers')}</Text>
                        <Text className="text-white text-2xl font-bold mt-1">128</Text>
                    </View>
                    <View className="bg-rose-500 w-[48%] p-4 rounded-2xl mb-4 shadow-sm">
                        <Text className="text-rose-100 text-sm font-medium">{t('pending')}</Text>
                        <Text className="text-white text-2xl font-bold mt-1">3</Text>
                    </View>
                </View>

                <Text className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    {t('quick_actions')}
                </Text>

                <View className="flex-row flex-wrap justify-between">
                    <QuickActionButton
                        icon="cart" label="new_sale"
                        color="#2563eb" onPress={() => router.push('/(tabs)/pos')}
                    />
                    <QuickActionButton
                        icon="cube" label="products"
                        color="#f59e0b" onPress={() => router.push('/(tabs)/products')}
                    />
                    <QuickActionButton
                        icon="document-text" label="history"
                        color="#10b981" onPress={() => console.log('History')}
                    />
                    <QuickActionButton
                        icon="settings" label="settings"
                        color="#64748b" onPress={() => router.push('/(tabs)/settings')}
                    />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const QuickActionButton = ({icon, label, onPress, color}: any) => {
    const {t} = useTranslation();
    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white dark:bg-slate-900 w-[48%] p-6 rounded-2xl mb-4 items-center justify-center shadow-sm border border-gray-100 dark:border-slate-800"
        >
            <Ionicons name={icon} size={32} color={color} style={{marginBottom: 8}}/>
            <Text className="font-semibold text-slate-700 dark:text-slate-200">
                {t(label)}
            </Text>
        </TouchableOpacity>
    );
};