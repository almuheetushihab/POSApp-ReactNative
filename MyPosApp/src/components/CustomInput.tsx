import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface CustomInputProps extends TextInputProps {
    label: string;
    error?: string;
    required?: boolean;
    containerClassName?: string;
}

export const CustomInput = ({
    label,
    error,
    required = false,
    containerClassName = '',
    className = '',
    ...props
}: CustomInputProps) => (
    <View className={`mb-5 ${containerClassName}`}>
        <Text className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            {label}{required ? ' *' : ''}
        </Text>
        <TextInput
            {...props}
            className={`rounded-2xl border bg-slate-50 px-4 py-4 text-base text-slate-900 dark:bg-slate-900 dark:text-white ${
                error ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
            } ${className}`}
            placeholderTextColor="#94a3b8"
        />
        {error ? <Text className="mt-1.5 text-xs font-medium text-red-600">{error}</Text> : null}
    </View>
);
