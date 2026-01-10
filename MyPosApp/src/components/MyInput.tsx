import React from 'react';
import { TextInput, View, Text } from 'react-native';
// @ts-ignore
import { styled } from 'nativewind';

const StyledInput = styled(TextInput);
const StyledView = styled(View);
const StyledText = styled(Text);

interface MyInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'numeric' | 'email-address';
}

export const MyInput: React.FC<MyInputProps> = ({
                                                    label,
                                                    value,
                                                    onChangeText,
                                                    placeholder,
                                                    secureTextEntry,
                                                    keyboardType = 'default'
                                                }) => {
    return (
        <StyledView className="my-2">
            <StyledText className="text-gray-700 font-semibold mb-2">{label}</StyledText>
            <StyledInput
                className="bg-white border border-gray-300 rounded-xl p-4 text-gray-800"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                placeholderTextColor="#94a3b8"
            />
        </StyledView>
    );
};