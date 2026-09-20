import React, { createContext, useContext, useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';

interface AuthContextValue {
    isAuthenticated: boolean;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    signUp: (shopName: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, hasHydrated, loginWithEmail, register, logout } = useAuthStore();

    const value = useMemo<AuthContextValue>(() => ({
        isAuthenticated,
        isLoading: !hasHydrated,
        signIn: loginWithEmail,
        signUp: register,
        signOut: logout,
    }), [hasHydrated, isAuthenticated, loginWithEmail, register, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
