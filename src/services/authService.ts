import type { User, LoginCredentials, RegisterData, AuthResponse } from '../types/auth';

// Mock kullanıcı veritabanı (gerçek uygulamada backend'den gelir)
const USERS_DB = new Map<string, {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    role: 'admin' | 'customer';
    createdAt: string;
}>();

// Admin kullanıcı oluştur
USERS_DB.set('admin@elektra.com', {
    id: 'admin-1',
    email: 'admin@elektra.com',
    name: 'Admin User',
    passwordHash: 'hashed_admin123', // Gerçekte bcrypt ile hash'lenir
    role: 'admin',
    createdAt: new Date().toISOString()
});

// Test kullanıcısı
USERS_DB.set('test@test.com', {
    id: 'user-1',
    email: 'test@test.com',
    name: 'Test User',
    passwordHash: 'hashed_123456',
    role: 'customer',
    createdAt: new Date().toISOString()
});

export class AuthService {
    private static readonly TOKEN_KEY = 'elektra_auth_token';
    private static readonly USER_KEY = 'elektra_user';

    // Basit password validation (gerçekte daha güçlü olmalı)
    static validatePassword(password: string): { valid: boolean; message: string } {
        if (password.length < 6) {
            return { valid: false, message: 'Şifre en az 6 karakter olmalıdır' };
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            return { valid: false, message: 'Şifre en az 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir' };
        }
        return { valid: true, message: '' };
    }

    // Email validation
    static validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Basit hash fonksiyonu (gerçekte bcrypt kullanılmalı)
    private static hashPassword(password: string): string {
        return `hashed_${password}`;
    }

    // JWT benzeri token oluştur (gerçekte JWT kullanılmalı)
    private static generateToken(user: User): string {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            exp: Date.now() + (24 * 60 * 60 * 1000) // 24 saat
        };
        return btoa(JSON.stringify(payload));
    }

    // Token doğrulama
    static validateToken(token: string): { valid: boolean; user?: User } {
        try {
            const payload = JSON.parse(atob(token));

            // Token süresi kontrol et
            if (payload.exp < Date.now()) {
                return { valid: false };
            }

            // Kullanıcı bilgilerini oluştur
            const user: User = {
                id: payload.userId,
                email: payload.email,
                name: USERS_DB.get(payload.email)?.name || '',
                role: payload.role,
                createdAt: USERS_DB.get(payload.email)?.createdAt || ''
            };

            return { valid: true, user };
        } catch (error) {
            return { valid: false };
        }
    }

    // Giriş yapma
    static async login(credentials: LoginCredentials): Promise<AuthResponse> {
        // Simulated network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { email, password } = credentials;

        // Email validation
        if (!this.validateEmail(email)) {
            return {
                success: false,
                message: 'Geçerli bir email adresi giriniz'
            };
        }

        // Password validation
        if (!password) {
            return {
                success: false,
                message: 'Şifre boş olamaz'
            };
        }

        // Kullanıcıyı bul
        const userData = USERS_DB.get(email);
        if (!userData) {
            return {
                success: false,
                message: 'Email veya şifre hatalı'
            };
        }

        // Şifre kontrol et
        const hashedPassword = this.hashPassword(password);
        if (userData.passwordHash !== hashedPassword) {
            return {
                success: false,
                message: 'Email veya şifre hatalı'
            };
        }

        // Kullanıcı objesi oluştur
        const user: User = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            createdAt: userData.createdAt
        };

        // Token oluştur
        const token = this.generateToken(user);

        // LocalStorage'a kaydet
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));

        return {
            success: true,
            user,
            token,
            message: 'Giriş başarılı!'
        };
    }

    // Kayıt olma
    static async register(data: RegisterData): Promise<AuthResponse> {
        // Simulated network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const { name, email, password, confirmPassword } = data;

        // Validasyonlar
        if (!name.trim()) {
            return { success: false, message: 'Ad soyad boş olamaz' };
        }

        if (!this.validateEmail(email)) {
            return { success: false, message: 'Geçerli bir email adresi giriniz' };
        }

        if (USERS_DB.has(email)) {
            return { success: false, message: 'Bu email adresi zaten kayıtlı' };
        }

        const passwordValidation = this.validatePassword(password);
        if (!passwordValidation.valid) {
            return { success: false, message: passwordValidation.message };
        }

        if (password !== confirmPassword) {
            return { success: false, message: 'Şifreler eşleşmiyor' };
        }

        // Yeni kullanıcı oluştur
        const userId = `user-${Date.now()}`;
        const newUserData = {
            id: userId,
            email,
            name,
            passwordHash: this.hashPassword(password),
            role: 'customer' as const,
            createdAt: new Date().toISOString()
        };

        // Veritabanına ekle
        USERS_DB.set(email, newUserData);

        // Kullanıcı objesi oluştur
        const user: User = {
            id: newUserData.id,
            email: newUserData.email,
            name: newUserData.name,
            role: newUserData.role,
            createdAt: newUserData.createdAt
        };

        // Token oluştur
        const token = this.generateToken(user);

        // LocalStorage'a kaydet
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));

        return {
            success: true,
            user,
            token,
            message: 'Kayıt başarılı! Hoş geldiniz!'
        };
    }

    // Çıkış yapma
    static logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    // Mevcut kullanıcıyı al
    static getCurrentUser(): { user: User | null; token: string | null } {
        const token = localStorage.getItem(this.TOKEN_KEY);
        const userStr = localStorage.getItem(this.USER_KEY);

        if (!token || !userStr) {
            return { user: null, token: null };
        }

        try {
            const user = JSON.parse(userStr);
            const tokenValidation = this.validateToken(token);

            if (!tokenValidation.valid) {
                this.logout();
                return { user: null, token: null };
            }

            return { user, token };
        } catch (error) {
            this.logout();
            return { user: null, token: null };
        }
    }
}