import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';
import { LoginScreen } from '../src/features/auth/LoginScreen';

export default function App() {
    const { isAuthenticated } = useAuthStore();

    if (isAuthenticated) {
        // If the user is authenticated, redirect them to the home screen.
        return <Redirect href="/(tabs)/home" />;
    }

    // Otherwise, show the login screen.
    return <LoginScreen />;
}