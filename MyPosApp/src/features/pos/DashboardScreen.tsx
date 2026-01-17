import React from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export const DashboardScreen = ({navigation}: any) => {
    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView contentContainerStyle={{padding: 20}}>

                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-2xl font-bold text-slate-800">Dashboard</Text>
                        <Text className="text-slate-500">Overview of your business</Text>
                    </View>
                    <View
                        className="h-10 w-10 bg-gray-200 rounded-full items-center justify-center border border-gray-300">
                        <Text className="font-bold text-slate-700">A</Text>
                    </View>
                </View>

                <View className="flex-row flex-wrap justify-between mb-6">
                    <View className="bg-blue-600 w-[48%] p-4 rounded-2xl mb-4 shadow-sm">
                        <Text className="text-blue-100 text-sm font-medium">Total Sales</Text>
                        <Text className="text-white text-2xl font-bold mt-1">৳ 15,200</Text>
                    </View>
                    <View className="bg-orange-500 w-[48%] p-4 rounded-2xl mb-4 shadow-sm">
                        <Text className="text-orange-100 text-sm font-medium">Total Orders</Text>
                        <Text className="text-white text-2xl font-bold mt-1">24</Text>
                    </View>
                    <View className="bg-emerald-500 w-[48%] p-4 rounded-2xl mb-4 shadow-sm">
                        <Text className="text-emerald-100 text-sm font-medium">Customers</Text>
                        <Text className="text-white text-2xl font-bold mt-1">128</Text>
                    </View>
                    <View className="bg-rose-500 w-[48%] p-4 rounded-2xl mb-4 shadow-sm">
                        <Text className="text-rose-100 text-sm font-medium">Pending</Text>
                        <Text className="text-white text-2xl font-bold mt-1">3</Text>
                    </View>
                </View>

                <Text className="text-xl font-bold text-slate-800 mb-4">Quick Actions</Text>
                <View className="flex-row flex-wrap justify-between">

                    <TouchableOpacity
                        onPress={() => console.log('New Sale')}
                        className="bg-white w-[48%] p-6 rounded-2xl mb-4 items-center justify-center shadow-sm border border-gray-100"
                    >
                        <Text className="text-3xl mb-2">🛒</Text>
                        <Text className="font-semibold text-slate-700">New Sale</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => console.log('Products')}
                        className="bg-white w-[48%] p-6 rounded-2xl mb-4 items-center justify-center shadow-sm border border-gray-100"
                    >
                        <Text className="text-3xl mb-2">📦</Text>
                        <Text className="font-semibold text-slate-700">Products</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => console.log('History')}
                        className="bg-white w-[48%] p-6 rounded-2xl mb-4 items-center justify-center shadow-sm border border-gray-100"
                    >
                        <Text className="text-3xl mb-2">📄</Text>
                        <Text className="font-semibold text-slate-700">History</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => console.log('Settings')}
                        className="bg-white w-[48%] p-6 rounded-2xl mb-4 items-center justify-center shadow-sm border border-gray-100"
                    >
                        <Text className="text-3xl mb-2">⚙️</Text>
                        <Text className="font-semibold text-slate-700">Settings</Text>
                    </TouchableOpacity>

                </View>

                <TouchableOpacity
                    onPress={() => navigation.replace('Login')}
                    className="bg-gray-200 p-4 rounded-xl items-center mt-4 active:opacity-70"
                >
                    <Text className="font-bold text-slate-600">Log Out</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};