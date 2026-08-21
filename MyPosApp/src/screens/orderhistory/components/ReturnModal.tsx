import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order, CartItem, ProductAttributes } from '../../../types/order';

interface ReturnModalProps {
    visible: boolean;
    onClose: () => void;
    order: Order;
    onSubmit: (itemsToReturn: CartItem[], reason: string) => void;
}

const formatAttributes = (attributes?: ProductAttributes) => {
    if (!attributes || Object.keys(attributes).length === 0) {
        return '';
    }
    return ' (' + Object.entries(attributes)
        .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
        .join(', ') + ')';
};

export const ReturnModal: React.FC<ReturnModalProps> = ({ visible, onClose, order, onSubmit }) => {
    const [itemsToReturn, setItemsToReturn] = useState<CartItem[]>([]);
    const [reason, setReason] = useState('');

    const handleQuantityChange = (item: CartItem, quantity: number) => {
        const existingItem = itemsToReturn.find(i => i.cartId === item.cartId);
        if (existingItem) {
            if (quantity > 0) {
                setItemsToReturn(itemsToReturn.map(i => i.cartId === item.cartId ? { ...i, quantity } : i));
            } else {
                setItemsToReturn(itemsToReturn.filter(i => i.cartId !== item.cartId));
            }
        } else if (quantity > 0) {
            setItemsToReturn([...itemsToReturn, { ...item, quantity }]);
        }
    };

    const getReturnQuantity = (cartId: string) => {
        return itemsToReturn.find(i => i.cartId === cartId)?.quantity || 0;
    };

    const calculateRefundAmount = () => {
        return itemsToReturn.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white dark:bg-slate-900 rounded-t-2xl p-6 h-[85%]">
                    <Text className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Process Return</Text>
                    <ScrollView>
                        <Text className="text-slate-600 dark:text-slate-400 mb-2">Select items and quantities to return:</Text>
                        {order.items.map(item => (
                            <View key={item.cartId} className="flex-row items-center justify-between bg-gray-50 dark:bg-slate-800 p-4 rounded-lg mb-2">
                                <View className="flex-1">
                                    <Text className="font-bold text-slate-800 dark:text-white">{item.name}</Text>
                                    <Text className="text-sm text-slate-500">{formatAttributes(item.attributes)}</Text>
                                    <Text className="text-sm text-slate-500">Sold: {item.quantity}</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <TouchableOpacity onPress={() => handleQuantityChange(item, getReturnQuantity(item.cartId!) - 1)} className="p-2">
                                        <Ionicons name="remove-circle" size={24} color="#ef4444" />
                                    </TouchableOpacity>
                                    <Text className="text-lg font-bold mx-4">{getReturnQuantity(item.cartId!)}</Text>
                                    <TouchableOpacity onPress={() => handleQuantityChange(item, Math.min(item.quantity, getReturnQuantity(item.cartId!) + 1))} className="p-2">
                                        <Ionicons name="add-circle" size={24} color="#22c55e" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                        <TextInput
                            className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg mt-4 text-slate-800 dark:text-white"
                            placeholder="Reason for return (optional)"
                            value={reason}
                            onChangeText={setReason}
                        />
                    </ScrollView>
                    <View className="mt-4">
                        <Text className="text-lg font-bold text-center">Refund Amount: ৳{calculateRefundAmount().toFixed(2)}</Text>
                        <TouchableOpacity onPress={() => onSubmit(itemsToReturn, reason)} className="bg-blue-600 p-4 rounded-lg mt-4">
                            <Text className="text-white text-center font-bold">Confirm Return</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose} className="p-4 mt-2">
                            <Text className="text-center text-red-500">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
