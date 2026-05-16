import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, ProductAttributes } from '../types/product';

interface AttributeSelectionModalProps {
    visible: boolean;
    product: Product;
    onClose: () => void;
    onSelect: (attributes: ProductAttributes) => void;
}

export const AttributeSelectionModal: React.FC<AttributeSelectionModalProps> = ({ visible, product, onClose, onSelect }) => {
    const [selectedAttributes, setSelectedAttributes] = useState<ProductAttributes>({});

    const handleSelect = (key: keyof ProductAttributes, value: any) => {
        setSelectedAttributes(prev => ({ ...prev, [key]: value }));
    };

    const renderAttributeOptions = () => {
        if (!product.attributes) return null;

        return Object.keys(product.attributes).map(key => {
            const attrKey = key as keyof ProductAttributes;
            const options = product.attributes[attrKey];

            if (Array.isArray(options)) {
                return (
                    <View key={key} className="mb-4">
                        <Text className="text-lg font-bold mb-2 capitalize text-slate-800 dark:text-white">{key}</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {options.map(option => (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => handleSelect(attrKey, option)}
                                    className={`px-4 py-2 rounded-full border ${selectedAttributes[attrKey] === option ? 'bg-blue-600 border-blue-600' : 'bg-gray-200 dark:bg-slate-700 border-transparent'}`}
                                >
                                    <Text className={`font-semibold ${selectedAttributes[attrKey] === option ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );
            }
            return null;
        });
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white dark:bg-slate-900 rounded-t-2xl p-6">
                    <Text className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Select Options for {product.name}</Text>
                    <ScrollView>
                        {renderAttributeOptions()}
                    </ScrollView>
                    <TouchableOpacity
                        onPress={() => onSelect(selectedAttributes)}
                        className="bg-blue-600 p-4 rounded-lg mt-4"
                    >
                        <Text className="text-white text-center font-bold">Add to Cart</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onClose} className="p-4 mt-2">
                        <Text className="text-center text-red-500">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
