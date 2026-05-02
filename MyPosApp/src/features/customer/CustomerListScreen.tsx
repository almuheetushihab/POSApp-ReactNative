import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useCustomerStore } from '../../store/useCustomerStore';
import { CustomerDetails } from '../../types/order';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const CustomerListScreen = () => {
    const { customers, searchCustomers, deleteCustomer } = useCustomerStore();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleDelete = (id: string, name: string) => {
        if (id === '1') { // Prevent deleting 'Walk-in Customer'
            Alert.alert("Cannot Delete", "'Walk-in Customer' is essential and cannot be deleted.");
            return;
        }
        Alert.alert(
            "Delete Customer",
            `Are you sure you want to delete ${name}? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteCustomer(id) }
            ]
        );
    };

    const filteredCustomers = searchQuery ? searchCustomers(searchQuery) : customers;

    const renderItem = ({ item }: { item: CustomerDetails }) => (
        <View className="flex-row items-center bg-white dark:bg-slate-900 p-4 my-1 rounded-lg border border-gray-100 dark:border-slate-800">
            <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 items-center justify-center mr-4">
                <Text className="text-blue-600 dark:text-blue-300 font-bold text-lg">{item.name.charAt(0)}</Text>
            </View>
            <View className="flex-1">
                <Text className="text-base font-bold text-slate-800 dark:text-white">{item.name}</Text>
                <Text className="text-sm text-slate-500 dark:text-slate-400">{item.phone}</Text>
            </View>
            <View className="flex-row items-center">
                <TouchableOpacity onPress={() => router.push(`/features/customer/edit?id=${item.id}`)} className="p-2">
                    <Feather name="edit" size={22} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} className="p-2 ml-2">
                    <Feather name="trash-2" size={22} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView edges={['bottom']} className="flex-1 bg-slate-50 dark:bg-slate-950">
            <View className="p-4">
                <View className="relative">
                    <TextInput
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg h-12 px-4 pl-10 text-slate-800 dark:text-white"
                        placeholder="Search by name or phone..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                    <View className="absolute left-3 top-3.5">
                        <Ionicons name="search" size={20} color="#94a3b8" />
                    </View>
                </View>
            </View>

            <FlatList
                data={filteredCustomers}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                ListEmptyComponent={() => (
                    <View className="flex-1 items-center justify-center mt-20">
                        <Ionicons name="sad-outline" size={48} color="#94a3b8" />
                        <Text className="text-slate-500 dark:text-slate-400 mt-4">No customers found.</Text>
                    </View>
                )}
            />

            <TouchableOpacity
                className="absolute right-6 bottom-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                onPress={() => router.push('/features/customer/add')}
            >
                <Feather name="plus" size={28} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default CustomerListScreen;