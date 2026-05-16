import React from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types/product';

interface SerialNumberModalProps {
    visible: boolean;
    product: Product;
    onClose: () => void;
    onSelect: (serialNumber: string) => void;
}

export const SerialNumberModal: React.FC<SerialNumberModalProps> = ({ visible, product, onClose, onSelect }) => {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-white dark:bg-slate-800 rounded-lg p-6 w-11/12">
                    <Text className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Select Serial Number for {product.name}</Text>
                    <FlatList
                        data={product.serialNumbers}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => onSelect(item)}
                                className="p-4 border-b border-gray-200 dark:border-slate-700"
                            >
                                <Text className="text-slate-800 dark:text-white">{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity onPress={onClose} className="mt-4 p-2">
                        <Text className="text-red-500 text-center">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
