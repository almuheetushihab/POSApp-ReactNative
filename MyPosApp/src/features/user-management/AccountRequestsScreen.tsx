import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { User, AccountStatus } from '../../types/user';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export const AccountRequestsScreen = () => {
    const router = useRouter();
    const [requests, setRequests] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const usersCollection = collection(db, 'users');
            const q = query(usersCollection, where('status', '==', 'Pending'));
            const querySnapshot = await getDocs(q);
            const requestList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setRequests(requestList);
        } catch (error) {
            Alert.alert('Error', 'Could not fetch account requests.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleRequestUpdate = async (userId: string, newStatus: AccountStatus) => {
        setIsUpdating(userId);
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { status: newStatus });
            // Remove the user from the list locally
            setRequests(prevRequests => prevRequests.filter(req => req.id !== userId));
            Alert.alert('Success', `Account has been ${newStatus}.`);
        } catch (error) {
            Alert.alert('Error', 'Failed to update account status.');
        } finally {
            setIsUpdating(null);
        }
    };

    const renderRequestItem = ({ item }: { item: User }) => (
        <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-3 border border-gray-100 dark:border-slate-700">
            <View className="flex-row justify-between items-center">
                <View>
                    <Text className="font-bold text-lg text-slate-800 dark:text-white">{item.name}</Text>
                    <Text className="text-sm text-slate-500 dark:text-slate-400">{item.email}</Text>
                    <View className="mt-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-md self-start">
                        <Text className="text-xs font-bold text-yellow-700 dark:text-yellow-400">Role: {item.role}</Text>
                    </View>
                </View>
                {isUpdating === item.id ? (
                    <ActivityIndicator color="#2563eb" />
                ) : (
                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                            onPress={() => handleRequestUpdate(item.id, 'Rejected')}
                            className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full"
                        >
                            <Ionicons name="close" size={20} color="#ef4444" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleRequestUpdate(item.id, 'Approved')}
                            className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full"
                        >
                            <Ionicons name="checkmark" size={20} color="#22c55e" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            <View className="flex-row items-center justify-between p-4">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#64748b" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-800 dark:text-white">Account Requests</Text>
                <View className="w-10" />
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#2563eb" className="mt-10" />
            ) : requests.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Ionicons name="checkmark-done-circle-outline" size={60} color="#94a3b8" />
                    <Text className="text-slate-500 mt-4">No pending requests.</Text>
                </View>
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderRequestItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                    onRefresh={fetchRequests}
                    refreshing={isLoading}
                />
            )}
        </SafeAreaView>
    );
};