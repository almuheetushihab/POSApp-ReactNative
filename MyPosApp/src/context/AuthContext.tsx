import React, { createContext, useContext, useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { UserRole } from '../types/user';

interface AuthContextValue {
    isAuthenticated: boolean;
    isLoading: boolean;
    activeRole: UserRole | null;
    signIn: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    signInWithPin: (pin: string) => Promise<{ success: boolean; message?: string }>;
    signUp: (shopName: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    lock: () => void;
    signOut: () => void;
    hasPermission: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const {
        isAuthenticated,
        activeRole,
        hasHydrated,
        loginWithEmail,
        login,
        register,
        lock,
        logout,
        hasPermission,
    } = useAuthStore();

    const value = useMemo<AuthContextValue>(() => ({
        isAuthenticated,
        isLoading: !hasHydrated,
        activeRole,
        signIn: loginWithEmail,
        signInWithPin: login,
        signUp: register,
        lock,
        signOut: logout,
        hasPermission,
    }), [activeRole, hasHydrated, hasPermission, isAuthenticated, lock, login, loginWithEmail, logout, register]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
