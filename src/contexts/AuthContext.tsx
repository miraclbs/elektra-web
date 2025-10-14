import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials, RegisterData } from '../types/auth';
import adminAuthService from '../services/adminAuthService.ts';

interface AuthContextType {
    user: User | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>; // Admin için
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Sayfa yüklendiğinde kullanıcıyı kontrol et
        const initAuth = async () => {
            try {
                const currentUser = adminAuthService.getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginCredentials): Promise<void> => {
        try {
            const result = await adminAuthService.login(credentials);
            if (result) {
                setUser(result.user);
            } else {
                throw new Error('Giriş başarısız');
            }
        } catch (error) {
            throw error;
        }
    };

    const register = async (data: RegisterData): Promise<void> => {
        try {
            // Sadece adminler kullanıcı oluşturabilir
            const newUser = await adminAuthService.createUser({
                name: data.name,
                email: data.email,
                password: data.password, // Password'ü ekledik
                role: 'customer' // Yeni kullanıcılar müşteri olarak oluşturulur
            });

            // Register işlemi sadece kullanıcı oluşturur, giriş yapmaz
            console.log('Yeni kullanıcı oluşturuldu:', newUser);
        } catch (error) {
            throw error;
        }
    };

    const logout = (): void => {
        adminAuthService.logout();
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};