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

interface RegisteredUser {
    email: string;
    password: string;
    shopName: string;
}

interface AuthStoreState extends AuthState {
    registeredUsers: RegisteredUser[];
    hasHydrated: boolean;
    setHasHydrated: (value: boolean) => void;
    login: (pin: string) => Promise<{ success: boolean; message?: string }>;
    loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    register: (shopName: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    lock: () => void;
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
            activeRole: null,
            registeredUsers: [],
            hasHydrated: false,
            setHasHydrated: (value: boolean) => set({ hasHydrated: value }),

            login: async (pin: string) => {
                // Simulate API call delay
                await new Promise((resolve) => setTimeout(resolve, 800));

                const user = MOCK_USERS.find(u => u.pin === pin);
                
                if (user) {
                    set({ activeRole: user.role });
                    return { success: true };
                } else {
                    return { success: false, message: 'Invalid PIN' };
                }
            },

            loginWithEmail: async (email: string, password: string) => {
                await new Promise((resolve) => setTimeout(resolve, 800));

                const normalizedEmail = email.trim().toLowerCase();
                const registeredUser = get().registeredUsers.find(
                    (candidate) => candidate.email === normalizedEmail && candidate.password === password
                );
                const mockUser = MOCK_USERS.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail);

                if (registeredUser) {
                    const user: User = {
                        id: `registered-${normalizedEmail}`,
                        name: registeredUser.shopName,
                        pin: '',
                        role: 'Admin',
                        email: registeredUser.email,
                    };

                    set({
                        isAuthenticated: true,
                        user,
                        token: `jwt-token-${user.id}-${Date.now()}`,
                        activeRole: null,
                    });
                    return { success: true };
                }

                if (!mockUser || password.length < 6) {
                    return { success: false, message: 'Invalid email or password' };
                }

                set({
                    isAuthenticated: true,
                    user: mockUser,
                    token: `jwt-token-${mockUser.id}-${Date.now()}`,
                    activeRole: null,
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

                const registeredUser: RegisteredUser = {
                    email: normalizedEmail,
                    password,
                    shopName: newUser.name,
                };

                set({
                    isAuthenticated: true,
                    user: newUser,
                    token: `jwt-token-${newUser.id}`,
                    activeRole: null,
                    registeredUsers: [...get().registeredUsers, registeredUser],
                });
                return { success: true };
            },

            lock: () => {
                set({ activeRole: null });
            },

            logout: () => {
                set({ isAuthenticated: false, user: null, token: null, activeRole: null });
            },

            hasPermission: (allowedRoles: UserRole[]) => {
                const { activeRole } = get();
                return activeRole !== null && allowedRoles.includes(activeRole);
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