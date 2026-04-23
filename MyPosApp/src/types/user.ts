export type UserRole = 'Admin' | 'Manager' | 'Cashier';

export interface User {
    id: string;
    name: string;
    pin: string; // In a real app, this would be a hashed password
    role: UserRole;
    assignedStoreId: string; // The store this employee is assigned to
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
}