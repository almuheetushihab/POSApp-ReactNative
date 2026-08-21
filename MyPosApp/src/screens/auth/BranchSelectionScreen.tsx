import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBranchStore } from '../../store/useBranchStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function BranchSelectionScreen() {
    const { branches, selectBranch } = useBranchStore();
    const { user } = useAuthStore();
    const router = useRouter();

    const handleSelectBranch = (branch) => {
        if (user?.branchId !== branch.id && user?.role !== 'Admin') {
            alert("You don't have access to this branch.");
            return;
        }
        selectBranch(branch);
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100 dark:bg-slate-900">
            <View className="p-8">
                <Text className="text-3xl font-bold text-slate-800 dark:text-white">Select a Branch</Text>
                <Text className="text-slate-500 mt-2">You only have access to your assigned branch.</Text>
            </View>
            <FlatList
                data={branches}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 24 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handleSelectBranch(item)}
                        className={`p-6 rounded-lg mb-4 flex-row justify-between items-center ${user?.branchId === item.id || user?.role === 'Admin' ? 'bg-white dark:bg-slate-800' : 'bg-gray-200 dark:bg-slate-700 opacity-50'}`}
                    >
                        <View>
                            <Text className="text-lg font-bold text-slate-800 dark:text-white">{item.name}</Text>
                            <Text className="text-slate-500">{item.address}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}
