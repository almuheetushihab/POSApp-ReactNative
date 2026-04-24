import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';

export default function App() {
    const { isAuthenticated } = useAuthStore();

    if (isAuthenticated) {
        // If the user is authenticated, redirect them to the home screen.
        return <Redirect href="/(tabs)/home" />;
    }

    // If not authenticated, redirect to the login page.
    return <Redirect href="/login" />;
}