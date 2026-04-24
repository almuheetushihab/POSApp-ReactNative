import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole, AuthState } from '../types/user';
import { auth } from '../services/firebaseConfig'; // Import Firebase auth instance
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// Mock Users Database (can be removed if using Firebase for all user management)
const MOCK_USERS: User[] = [
    { id: '1', name: 'Super Admin', email: 'admin@mypos.com', password: 'password', role: 'Admin' },
    { id: '2', name: 'Store Manager', email: 'manager@mypos.com', password: 'password', role: 'Manager' },
    { id: '3', name: 'John Cashier', email: 'cashier@mypos.com', password: 'password', role: 'Cashier' },
];

interface AuthStoreState extends AuthState {
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    hasPermission: (allowedRoles: UserRole[]) => boolean;
    setFirebaseUser: (firebaseUser: FirebaseUser | null) => void;
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

            setFirebaseUser: (firebaseUser) => {
                if (firebaseUser) {
                    // In a real app, you might fetch additional user details (like role) from your own backend
                    // using the firebaseUser.uid
                    const appUser: User = {
                        id: firebaseUser.uid,
                        name: firebaseUser.displayName || 'Google User',
                        email: firebaseUser.email || '',
                        role: 'Manager', // Default role for Google sign-in for now
                        avatarUrl: firebaseUser.photoURL || undefined,
                    };
                    set({ isAuthenticated: true, user: appUser, token: firebaseUser.refreshToken });
                } else {
                    set({ isAuthenticated: false, user: null, token: null });
                }
            },

            logout: async () => {
                await auth.signOut();
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

// Listen for Firebase auth state changes and update the store
onAuthStateChanged(auth, (user) => {
    useAuthStore.getState().setFirebaseUser(user);
});