import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface MyButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    isLoading?: boolean;
}

export const MyButton: React.FC<MyButtonProps> = ({
                                                      title,
                                                      onPress,
                                                      variant = 'primary',
                                                      isLoading = false
                                                  }) => {

    let bgClass = 'bg-blue-600';
    let textClass = 'text-white';

    if (variant === 'secondary') bgClass = 'bg-slate-800';
    if (variant === 'danger') bgClass = 'bg-red-500';
    if (variant === 'outline') {
        bgClass = 'bg-transparent border border-blue-600';
        textClass = 'text-blue-600';
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            className={`p-4 rounded-xl items-center justify-center ${bgClass} active:opacity-80 my-2`}
            disabled={isLoading}
        >
            {isLoading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text className={`font-bold text-lg ${textClass}`}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};