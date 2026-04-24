export type UserRole = 'Admin' | 'Manager' | 'Cashier';
export type AccountStatus = 'Pending' | 'Approved' | 'Rejected';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: AccountStatus; // To manage account approval
    password?: string; // Hashed password from your backend
    pin?: string; // Optional for PIN-based login
    assignedStoreId?: string; // The store this employee is assigned to
    avatarUrl?: string; // Profile picture from Google or other providers
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
}