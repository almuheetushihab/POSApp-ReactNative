export type UserRole = 'Admin' | 'Manager' | 'Cashier';

export interface User {
    id: string;
    name: string;
    pin: string; // Staff PIN; email accounts can leave this empty until PIN access is enabled.
    role: UserRole;
    email?: string;
    avatar?: string; // URI to avatar image
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
}