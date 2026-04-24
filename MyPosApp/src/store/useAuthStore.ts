import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole, AuthState } from '../types/user';

// Mock Users Database
const MOCK_USERS: User[] = [
    { id: '1', name: 'Super Admin', email: 'admin@mypos.com', password: 'password', role: 'Admin' },
    { id: '2', name: 'Store Manager', email: 'manager@mypos.com', password: 'password', role: 'Manager' },
    { id: '3', name: 'John Cashier', email: 'cashier@mypos.com', password: 'password', role: 'Cashier' },
];

interface AuthStoreState extends AuthState {
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    hasPermission: (allowedRoles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthStoreState>()(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            user: null,
            token: null,

            login: async (email, password) => {
                await new Promise((resolve) => setTimeout(resolve, 800));
                const user = MOCK_USERS.find(u => u.email === email && u.password === password);
                
                if (user) {
                    const mockToken = `jwt-token-${user.id}-${Date.now()}`;
                    set({ isAuthenticated: true, user, token: mockToken });
                    return { success: true };
                } else {
                    return { success: false, message: 'Invalid credentials' };
                }
            },

            loginWithGoogle: async () => {
                // In a real app, this would involve exchanging a token from expo-auth-session
                // with your backend to get a user profile and JWT.
                await new Promise((resolve) => setTimeout(resolve, 1000));
                
                // For this demo, we'll log in as the Manager user.
                const user = MOCK_USERS.find(u => u.role === 'Manager');
                if (user) {
                    const mockToken = `jwt-token-google-${user.id}-${Date.now()}`;
                    set({ isAuthenticated: true, user, token: mockToken });
                    return { success: true };
                }
                return { success: false, message: 'Mock Google user not found' };
            },

            logout: () => {
                set({ isAuthenticated: false, user: null, token: null });
            },

            hasPermission: (allowedRoles: UserRole[]) => {
                const { user } = get();
                if (!user) return false;
                return allowedRoles.includes(user.role);
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);