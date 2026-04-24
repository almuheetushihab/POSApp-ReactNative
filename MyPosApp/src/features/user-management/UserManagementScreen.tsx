import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { User, UserRole } from '../../types/user';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export const UserManagementScreen = () => {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const usersCollection = collection(db, 'users');
            const querySnapshot = await getDocs(usersCollection);
            const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setUsers(userList);
        } catch (error) {
            Alert.alert('Error', 'Could not fetch users.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = (userId: string, newRole: UserRole) => {
        Alert.alert(
            'Confirm Role Change',
            `Are you sure you want to change this user's role to ${newRole}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setIsUpdating(userId);
                        try {
                            const userRef = doc(db, 'users', userId);
                            await updateDoc(userRef, { role: newRole });
                            // Update local state to reflect the change immediately
                            setUsers(prevUsers =>
                                prevUsers.map(user =>
                                    user.id === userId ? { ...user, role: newRole } : user
                                )
                            );
                            Alert.alert('Success', 'User role updated successfully.');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to update user role.');
                        } finally {
                            setIsUpdating(null);
                        }
                    },
                },
            ]
        );
    };

    const renderUserItem = ({ item }: { item: User }) => (
        <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-3 border border-gray-100 dark:border-slate-700">
            <View className="flex-row justify-between items-center">
                <View>
                    <Text className="font-bold text-lg text-slate-800 dark:text-white">{item.name}</Text>
                    <Text className="text-sm text-slate-500 dark:text-slate-400">{item.email}</Text>
                </View>
                {isUpdating === item.id ? (
                    <ActivityIndicator color="#2563eb" />
                ) : (
                    <View className="flex-row items-center gap-2">
                        <RoleButton user={item} role="Cashier" onPress={handleRoleChange} />
                        <RoleButton user={item} role="Manager" onPress={handleRoleChange} />
                        <RoleButton user={item} role="Admin" onPress={handleRoleChange} />
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
                <Text className="text-xl font-bold text-slate-800 dark:text-white">User Management</Text>
                <View className="w-10" />
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#2563eb" className="mt-10" />
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                    onRefresh={fetchUsers}
                    refreshing={isLoading}
                />
            )}
        </SafeAreaView>
    );
};

const RoleButton = ({ user, role, onPress }: { user: User, role: UserRole, onPress: (userId: string, newRole: UserRole) => void }) => {
    const isActive = user.role === role;
    return (
        <TouchableOpacity
            onPress={() => onPress(user.id, role)}
            disabled={isActive}
            className={`px-3 py-1 rounded-full ${
                isActive
                    ? 'bg-blue-600'
                    : 'bg-gray-200 dark:bg-slate-700'
            }`}
        >
            <Text className={`font-bold text-xs ${
                isActive
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-300'
            }`}>{role}</Text>
        </TouchableOpacity>
    );
};