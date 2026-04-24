import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCustomerStore } from '../../store/useCustomerStore';
import { Customer } from '../../types/customer';
import { useSettingsStore } from '../../store/useSettingsStore';
import { AddEditCustomerModal } from './AddEditCustomerModal';

export default function CustomerListScreen() {
    const router = useRouter();
    const { customers, isLoaded, fetchInitialCustomers } = useCustomerStore();
    const { activeStoreId } = useSettingsStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);

    // Re-fetch data every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchInitialCustomers(true);
        }, [])
    );

    // Filter customers by active store first, then by search query
    const storeFilteredCustomers = customers.filter(c => c.storeId === activeStoreId);

    const finalFilteredCustomers = storeFilteredCustomers.filter(
        c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.phone && c.phone.includes(searchQuery))
    ).sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0)); // Sort by total spent

    const renderCustomerItem = ({ item }: { item: Customer }) => (
        <TouchableOpacity
            onPress={() => router.push({ pathname: '/customerdetails', params: { customerId: item.id } })}
            className="bg-white dark:bg-slate-900 p-4 mb-3 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex-row items-center"
        >
            <View className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/20 items-center justify-center mr-4 border border-blue-100 dark:border-blue-900/30">
                <Ionicons name="person-outline" size={24} color="#2563eb" />
            </View>
            <View className="flex-1">
                <Text className="text-slate-800 dark:text-white font-bold text-base">{item.name}</Text>
                <Text className="text-slate-500 text-sm">{item.phone}</Text>
            </View>
            <View className="items-end">
                <Text className="text-green-600 font-bold text-base">৳{item.totalSpent?.toFixed(0) || 0}</Text>
                <View className="flex-row items-center mt-1 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">
                    <Ionicons name="star" size={10} color="#d97706" />
                    <Text className="text-amber-700 dark:text-amber-400 text-xs font-bold ml-1">{item.loyaltyPoints || 0} pts</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950" edges={['top']}>
            {/* Header */}
            <View className="flex-row items-center justify-between p-5 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
                <Text className="text-2xl font-bold text-slate-800 dark:text-white">Customers</Text>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="bg-blue-600 px-4 py-2 rounded-xl flex-row items-center gap-2"
                >
                    <Ionicons name="add" size={16} color="white" />
                    <Text className="text-white font-bold">Add Customer</Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="p-5">
                <View className="flex-row items-center bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-4">
                    <Ionicons name="search" size={20} color="#94a3b8" />
                    <TextInput
                        className="flex-1 p-3 text-slate-800 dark:text-white font-medium"
                        placeholder="Search by name or phone..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Customer List */}
            {!isLoaded ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563eb"/>
                    <Text className="text-slate-400 mt-2">Loading Customers...</Text>
                </View>
            ) : (
                <FlatList
                    data={finalFilteredCustomers}
                    keyExtractor={(item) => item.id as string}
                    renderItem={renderCustomerItem}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Ionicons name="people-outline" size={50} color="#cbd5e1" />
                            <Text className="text-slate-400 mt-2">No customers found in this store.</Text>
                        </View>
                    }
                />
            )}
            
            <AddEditCustomerModal 
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                customerToEdit={null}
            />
        </SafeAreaView>
    );
}