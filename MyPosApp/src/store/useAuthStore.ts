import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole, AuthState } from '../types/user';

// Mock Users Database
const MOCK_USERS: User[] = [
    { id: '1', name: 'Super Admin', pin: '0000', role: 'Admin', email: 'admin@shop.com' },
    { id: '2', name: 'Store Manager', pin: '1234', role: 'Manager', email: 'manager@shop.com' },
    { id: '3', name: 'John Cashier', pin: '1111', role: 'Cashier', email: 'cashier@shop.com' },
];

interface AuthStoreState extends AuthState {
    hasHydrated: boolean;
    setHasHydrated: (value: boolean) => void;
    login: (pin: string) => Promise<{ success: boolean; message?: string }>;
    loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    register: (shopName: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    hasPermission: (allowedRoles: UserRole[]) => boolean;
    updateProfile: (changes: Partial<User>) => void;
}

export const useAuthStore = create<AuthStoreState>()(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            user: null,
            token: null,
            hasHydrated: false,
            setHasHydrated: (value: boolean) => set({ hasHydrated: value }),

            login: async (pin: string) => {
                // Simulate API call delay
                await new Promise((resolve) => setTimeout(resolve, 800));

                const user = MOCK_USERS.find(u => u.pin === pin);
                
                if (user) {
                    // Simulate a JWT token generation
                    const mockToken = `jwt-token-${user.id}-${Date.now()}`;
                    set({
                        isAuthenticated: true,
                        user: user,
                        token: mockToken
                    });
                    return { success: true };
                } else {
                    return { success: false, message: 'Invalid PIN' };
                }
            },

            loginWithEmail: async (email: string, password: string) => {
                await new Promise((resolve) => setTimeout(resolve, 800));

                const normalizedEmail = email.trim().toLowerCase();
                const user = MOCK_USERS.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail);

                if (!user || password.length < 6) {
                    return { success: false, message: 'Invalid email or password' };
                }

                set({
                    isAuthenticated: true,
                    user,
                    token: `jwt-token-${user.id}-${Date.now()}`,
                });
                return { success: true };
            },

            register: async (shopName: string, email: string, password: string) => {
                await new Promise((resolve) => setTimeout(resolve, 800));

                const normalizedEmail = email.trim().toLowerCase();
                if (!shopName.trim() || !normalizedEmail || password.length < 6) {
                    return { success: false, message: 'Please complete all fields correctly' };
                }

                const newUser: User = {
                    id: `user-${Date.now()}`,
                    name: shopName.trim(),
                    pin: '',
                    role: 'Admin',
                    email: normalizedEmail,
                };

                set({
                    isAuthenticated: true,
                    user: newUser,
                    token: `jwt-token-${newUser.id}`,
                });
                return { success: true };
            },

            logout: () => {
                set({ isAuthenticated: false, user: null, token: null });
            },

            hasPermission: (allowedRoles: UserRole[]) => {
                const { user } = get();
                if (!user) return false;
                return allowedRoles.includes(user.role);
            },

            updateProfile: (changes: Partial<User>) => {
                const { user } = get();
                if (!user) return;
                const updated = { ...user, ...changes } as User;
                set({ user: updated });
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);