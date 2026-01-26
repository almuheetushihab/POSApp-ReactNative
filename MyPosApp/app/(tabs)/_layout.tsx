import {Tabs} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {useTranslation} from 'react-i18next';
import React from 'react';

export default function TabLayout() {
    const {colorScheme} = useColorScheme();
    const {t} = useTranslation();

    const isDark = colorScheme === 'dark';

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: isDark ? '#60a5fa' : '#2563eb',
                tabBarInactiveTintColor: isDark ? '#94a3b8' : '#64748b',

                tabBarStyle: {
                    height: 65,
                    paddingBottom: 10,
                    paddingTop: 10,
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderTopColor: isDark ? '#1e293b' : '#f1f5f9',
                    borderTopWidth: 1,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginTop: 2,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: t('nav_home'),
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name="grid-outline" size={size} color={color}/>
                    ),
                }}
            />

            <Tabs.Screen
                name="pos"
                options={{
                    title: t('nav_sale'),
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name="cart-outline" size={size} color={color}/>
                    ),
                }}
            />

            <Tabs.Screen
                name="products"
                options={{
                    title: t('nav_items'),
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name="cube-outline" size={size} color={color}/>
                    ),
                }}
            />

            <Tabs.Screen
                name="settings"
                options={{
                    title: t('nav_settings'),
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name="settings-outline" size={size} color={color}/>
                    ),
                }}
            />
        </Tabs>
    );
}