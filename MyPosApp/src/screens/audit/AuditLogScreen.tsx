import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuditLogStore } from '../../store/useAuditLogStore';
import { AuditLogEntry } from '../../types/audit';
import { Ionicons } from '@expo/vector-icons';

const AuditLogItem = ({ item }: { item: AuditLogEntry }) => (
    <View className="p-4 border-b border-gray-200 dark:border-slate-700">
        <Text className="font-bold text-slate-800 dark:text-white">{item.actionType.replace('_', ' ')}</Text>
        <Text className="text-slate-600 dark:text-slate-400">{item.details}</Text>
        <View className="flex-row justify-between mt-2">
            <Text className="text-xs text-slate-500">{item.userName} ({item.userId})</Text>
            <Text className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</Text>
        </View>
    </View>
);

export default function AuditLogScreen() {
    const { logs } = useAuditLogStore();

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            <View className="flex-row items-center p-4 border-b border-gray-200 dark:border-slate-800">
                <Ionicons name="shield-checkmark-outline" size={24} color="#2563eb" />
                <Text className="text-2xl font-bold ml-2 text-slate-800 dark:text-white">Audit Log</Text>
            </View>
            <FlatList
                data={logs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <AuditLogItem item={item} />}
                ListEmptyComponent={<Text className="text-center p-4 text-slate-500">No audit logs found.</Text>}
            />
        </SafeAreaView>
    );
}
