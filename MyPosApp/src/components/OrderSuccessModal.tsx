import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../types/order';

interface OrderSuccessModalProps {
    visible: boolean;
    order: Order | null;
    onClose: () => void;
}

export const OrderSuccessModal = ({ visible, order, onClose }: OrderSuccessModalProps) => {
    if (!order) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/60 justify-center items-center p-5">
                <View className="bg-white w-full max-w-sm rounded-3xl overflow-hidden">

                    {/* Header */}
                    <View className="bg-green-500 p-6 items-center">
                        <View className="bg-white/20 p-3 rounded-full mb-3">
                            <Ionicons name="checkmark" size={40} color="white" />
                        </View>
                        <Text className="text-white text-2xl font-bold">Payment Success!</Text>
                        <Text className="text-green-100 mt-1">Order #{order.id.slice(-6).toUpperCase()}</Text>
                    </View>

                    {/* Receipt Content */}
                    <ScrollView className="p-6">
                        <View className="items-center mb-6">
                            <Text className="text-slate-500 text-sm">Total Amount</Text>
                            <Text className="text-4xl font-bold text-slate-800">৳ {order.totalAmount}</Text>
                        </View>

                        <View className="border-t border-dashed border-gray-300 my-2" />

                        <Text className="text-slate-400 text-xs font-bold uppercase mb-3 mt-4">Items Purchased</Text>
                        {order.items.map((item, index) => (
                            <View key={index} className="flex-row justify-between mb-2">
                                <Text className="text-slate-600 font-medium flex-1">
                                    {item.name} <Text className="text-slate-400">x{item.quantity}</Text>
                                </Text>
                                <Text className="text-slate-800 font-bold">৳ {item.price * item.quantity}</Text>
                            </View>
                        ))}

                        <View className="border-t border-dashed border-gray-300 my-4" />

                        <View className="flex-row justify-between mb-2">
                            <Text className="text-slate-500">Date</Text>
                            <Text className="text-slate-800 font-medium">{new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString()}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-slate-500">Payment Method</Text>
                            <Text className="text-slate-800 font-bold">{order.paymentMethod}</Text>
                        </View>
                    </ScrollView>

                    {/* Footer Button */}
                    <View className="p-5 border-t border-gray-100">
                        <TouchableOpacity
                            onPress={onClose}
                            className="bg-slate-900 p-4 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold text-lg">New Sale</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
};