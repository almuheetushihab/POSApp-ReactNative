import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole, AuthState, AccountStatus } from '../types/user';
import { auth, db } from '../services/firebaseConfig';
import { 
    onAuthStateChanged, 
    User as FirebaseUser,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthStoreState extends AuthState {
    signUp: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
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

            signUp: async (name, email, password, role) => {
                try {
                    // We create a temporary user in auth, but the real "account" is in Firestore
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    await updateProfile(userCredential.user, { displayName: name });
                    
                    const userRef = doc(db, "users", userCredential.user.uid);
                    const newUser: User = {
                        id: userCredential.user.uid,
                        name: name,
                        email: email,
                        role: role,
                        status: 'Pending', // New accounts are pending approval
                    };
                    await setDoc(userRef, newUser);

                    // Sign the user out immediately after sign-up
                    await auth.signOut();

                    return { success: true };
                } catch (error: any) {
                    return { success: false, message: error.message };
                }
            },

            login: async (email, password) => {
                try {
                    const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    const userDocRef = doc(db, 'users', userCredential.user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data() as User;
                        if (userData.status === 'Approved') {
                            // The onAuthStateChanged listener will handle setting the user state
                            return { success: true };
                        } else if (userData.status === 'Pending') {
                            await auth.signOut(); // Log out user if pending
                            return { success: false, message: 'Your account is awaiting approval.' };
                        } else {
                            await auth.signOut(); // Log out user if rejected
                            return { success: false, message: 'Your account request has been rejected.' };
                        }
                    }
                    // This case is for users who might exist in Auth but not in Firestore (e.g. old system)
                    await auth.signOut();
                    return { success: false, message: 'User data not found. Please contact admin.' };
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

            setFirebaseUser: async (firebaseUser) => {
                if (firebaseUser) {
                    const userRef = doc(db, "users", firebaseUser.uid);
                    const docSnap = await getDoc(userRef);

                    if (docSnap.exists() && docSnap.data().status === 'Approved') {
                        const userData = docSnap.data() as User;
                        const appUser: User = {
                            id: firebaseUser.uid,
                            name: userData.name,
                            email: userData.email,
                            role: userData.role,
                            status: userData.status,
                            avatarUrl: firebaseUser.photoURL || undefined,
                        };
                        set({ isAuthenticated: true, user: appUser, token: firebaseUser.refreshToken });
                    } else {
                        // If user is not approved or doesn't exist in Firestore, keep them logged out
                        set({ isAuthenticated: false, user: null, token: null });
                    }
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