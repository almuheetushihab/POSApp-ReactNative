export type UserRole = 'Admin' | 'Manager' | 'Cashier';

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // Hashed password from your backend
    pin?: string; // Optional for PIN-based login
    role: UserRole;
    assignedStoreId?: string; // The store this employee is assigned to
    avatarUrl?: string; // Profile picture from Google or other providers
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
}