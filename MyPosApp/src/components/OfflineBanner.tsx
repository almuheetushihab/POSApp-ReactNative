import React from 'react';
import { View, Text } from 'react-native';
import { useNetworkStore } from '../store/useNetworkStore';
import { Ionicons } from '@expo/vector-icons';

export const OfflineBanner = () => {
    const { isOnline } = useNetworkStore();

    if (isOnline) {
        return null; // Don't render anything if online
    }

    return (
        <View className="bg-red-500 p-2 items-center justify-center flex-row w-full">
            <Ionicons name="cloud-offline-outline" size={16} color="white" />
            <Text className="text-white text-sm font-bold ml-2">You are currently offline</Text>
        </View>
    );
};
