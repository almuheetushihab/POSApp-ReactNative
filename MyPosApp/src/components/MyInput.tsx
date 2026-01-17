import React, {act } from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';

interface MyInputProps extends TextInputProps {
    label: string;
}

export const MyInput: React.FC<MyInputProps> = ({
                                                    label,
                                                    className,
                                                    ...props
                                                }) => {
    return (
        <View className="my-2">
            <Text className="text-gray-700 font-semibold mb-2">{label}</Text>
            <TextInput
                className="bg-white border border-gray-300 rounded-xl p-4 text-gray-800"
                placeholderTextColor="#94a3b8"
                {...props}
            />
        </View>
    );
};