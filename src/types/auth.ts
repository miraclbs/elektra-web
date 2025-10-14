export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'customer';
    createdAt?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface AuthResponse {
    success: boolean;
    user?: User;
    token?: string;
    message: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    register: (data: RegisterData) => Promise<AuthResponse>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}