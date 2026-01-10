import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
// @ts-ignore
import {styled} from "nativewind";

const StyledButton = styled(TouchableOpacity);
const StyledText = styled(Text);

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

    let bgClass = 'bg-primary';
    let textClass = 'text-white';

    if (variant === 'secondary') bgClass = 'bg-secondary';
    if (variant === 'danger') bgClass = 'bg-danger';
    if (variant === 'outline') {
        bgClass = 'bg-transparent border border-primary';
        textClass = 'text-primary';
    }

    return (
        <StyledButton
            onPress={onPress}
            className={`p-4 rounded-xl items-center justify-center ${bgClass} active:opacity-80 my-2`}
            disabled={isLoading}
        >
            {isLoading ? (
                <ActivityIndicator color="white" />
            ) : (
                <StyledText className={`font-bold text-lg ${textClass}`}>
                    {title}
                </StyledText>
            )}
        </StyledButton>
    );
};