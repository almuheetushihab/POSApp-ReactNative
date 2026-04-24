import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole, AuthState } from '../types/user';
import { auth } from '../services/firebaseConfig';
import { 
    onAuthStateChanged, 
    User as FirebaseUser,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';

interface AuthStoreState extends AuthState {
    signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
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

            signUp: async (name, email, password) => {
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    await updateProfile(userCredential.user, { displayName: name });
                    // The onAuthStateChanged listener will handle setting the user state
                    return { success: true };
                } catch (error: any) {
                    return { success: false, message: error.message };
                }
            },

            login: async (email, password) => {
                try {
                    await signInWithEmailAndPassword(auth, email, password);
                    return { success: true };
                } catch (error: any) {
                    return { success: false, message: error.message };
                }
            },

            resetPassword: async (email: string) => {
                try {
                    await sendPasswordResetEmail(auth, email);
                    return { success: true };
                } catch (error: any) {
                    return { success: false, message: error.message };
                }
            },

            setFirebaseUser: (firebaseUser) => {
                if (firebaseUser) {
                    const appUser: User = {
                        id: firebaseUser.uid,
                        name: firebaseUser.displayName || 'New User',
                        email: firebaseUser.email || '',
                        role: 'Cashier', // Default role for new sign-ups
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