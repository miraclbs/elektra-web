import { supabase } from '../lib/supabase';
import type { User, LoginCredentials } from '../types/auth';

// Admin-kontrollü kullanıcı sistemi
class AdminAuthService {

    // 1. Sadece giriş yapma (kayıt yok!)
    async login(credentials: LoginCredentials): Promise<{ user: User; token: string } | null> {
        try {
            console.log('🔐 Supabase login kontrolü...');

            // Supabase'den kullanıcı kontrol et
            const { data: userData, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', credentials.email)
                .eq('password', credentials.password)
                .single();

            if (error || !userData) {
                console.error('❌ Login hatası:', error);
                throw new Error('Email veya şifre hatalı');
            }

            console.log('✅ Supabase login başarılı:', userData.email);

            const user: User = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role as 'admin' | 'customer',
                createdAt: userData.created_at
            };

            const token = this.generateToken(user);
            this.saveSession(user, token);

            return { user, token };

        } catch (error: any) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // 2. Admin: Kullanıcı oluşturma
    async createUser(userData: {
        name: string;
        email: string;
        password: string;
        role: 'admin' | 'customer';
    }): Promise<User> {
        try {
            // Admin kontrolü
            const currentUser = this.getCurrentUser();
            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Sadece adminler kullanıcı oluşturabilir');
            }

            // Email kontrolü
            if (!userData.email || !userData.name || !userData.password) {
                throw new Error('Tüm alanlar doldurulmalıdır');
            }

            console.log('🚀 Supabase\'e kullanıcı ekleniyor...');

            // Supabase'e kullanıcı ekle
            const { data, error } = await supabase
                .from('users')
                .insert([{
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    role: userData.role,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) {
                console.error('❌ Supabase insert hatası:', error);

                // Email çakışması kontrolü
                if (error.code === '23505') { // unique_violation
                    throw new Error('Bu email zaten kullanımda');
                }

                throw new Error('Kullanıcı kaydedilemedi: ' + error.message);
            }

            console.log('✅ Supabase\'e başarıyla kaydedildi:', data);
            return {
                id: data.id,
                name: data.name,
                email: data.email,
                role: data.role as 'admin' | 'customer',
                createdAt: data.created_at
            };
        } catch (error: any) {
            console.error('Create user error:', error);
            throw error;
        }
    }

    // Debug: Supabase tablo yapısını kontrol et
    async checkTableStructure(): Promise<void> {
        try {
            console.log('🔍 Checking Supabase table structure...');

            // Check if users table exists and get its structure
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .limit(1);

            if (error) {
                console.error('❌ Error accessing users table:', error);
                console.error('Error details:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                });
                return;
            }

            console.log('✅ Users table accessible');
            console.log('📊 Sample data structure:', data);

            // Test insert permissions
            console.log('🧪 Testing insert permissions...');
            const testUser = {
                name: 'Test User ' + Date.now(),
                email: 'test_' + Date.now() + '@example.com',
                password: 'test123',
                role: 'customer'
            };

            const { data: insertData, error: insertError } = await supabase
                .from('users')
                .insert([testUser])
                .select();

            if (insertError) {
                console.error('❌ Insert test failed:', {
                    message: insertError.message,
                    code: insertError.code,
                    details: insertError.details,
                    hint: insertError.hint
                });
            } else {
                console.log('✅ Insert test successful:', insertData);

                // Clean up test user
                if (insertData && insertData[0]) {
                    await supabase
                        .from('users')
                        .delete()
                        .eq('id', insertData[0].id);
                    console.log('🧹 Test user cleaned up');
                }
            }

        } catch (error) {
            console.error('💥 Error in checkTableStructure:', error);
        }
    }

    // 4. Admin: Tüm kullanıcıları getir
    async getAllUsers(): Promise<User[]> {
        try {
            // Admin kontrolü
            const currentUser = this.getCurrentUser();
            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Sadece adminler kullanıcıları görebilir');
            }

            console.log('� Supabase\'den kullanıcılar getiriliyor...');

            // Supabase'den kullanıcıları getir
            const { data: users, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Supabase users fetch hatası:', error);
                throw new Error('Kullanıcılar getirilemedi: ' + error.message);
            }

            console.log('✅ Supabase\'den', users?.length || 0, 'kullanıcı alındı');

            if (!users || users.length === 0) {
                return [];
            }

            return users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role as 'admin' | 'customer',
                createdAt: user.created_at
            }));

        } catch (error: any) {
            console.error('Get users error:', error);
            throw error;
        }
    }

    // 5. Admin: Kullanıcı silme
    async deleteUser(userId: string): Promise<void> {
        try {
            // Admin kontrolü
            const currentUser = this.getCurrentUser();
            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Sadece adminler kullanıcı silebilir');
            }

            // Kendi kendini silmeyi engelle
            if (currentUser.id === userId) {
                throw new Error('Kendi hesabınızı silemezsiniz');
            }

            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) {
                console.error('❌ Supabase delete hatası:', error);
                throw new Error('Kullanıcı silinemedi: ' + error.message);
            }

            console.log('✅ Kullanıcı başarıyla silindi');

        } catch (error: any) {
            console.error('Delete user error:', error);
            throw error;
        }
    }

    // 6. Mevcut kullanıcıyı getir
    getCurrentUser(): User | null {
        try {
            const userStr = localStorage.getItem('elektra_user');
            const token = localStorage.getItem('elektra_token');

            if (!userStr || !token) return null;

            const user = JSON.parse(userStr);

            // Token kontrolü
            if (!this.validateToken(token)) {
                this.logout();
                return null;
            }

            return user;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    // 7. Token doğrulama
    private validateToken(token: string): boolean {
        try {
            // Basit token kontrolü (gerçek uygulamada JWT kullanılır)
            const parts = token.split('.');
            if (parts.length !== 3) return false;

            const payload = JSON.parse(atob(parts[1]));
            const now = Math.floor(Date.now() / 1000);

            return payload.exp > now;
        } catch {
            return false;
        }
    }

    // 8. Token oluşturma
    private generateToken(user: User): string {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            sub: user.id,
            email: user.email,
            role: user.role,
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 saat
        }));
        const signature = btoa('elektra-demo-signature');

        return `${header}.${payload}.${signature}`;
    }

    // 9. Session kaydetme
    private saveSession(user: User, token: string): void {
        localStorage.setItem('elektra_user', JSON.stringify(user));
        localStorage.setItem('elektra_token', token);
    }

    // 10. Çıkış yapma
    logout(): void {
        localStorage.removeItem('elektra_user');
        localStorage.removeItem('elektra_token');
    }

    // 11. User stats
    async getUserStats(): Promise<{
        totalUsers: number;
        adminCount: number;
        customerCount: number;
        recentUsers: number;
    }> {
        try {
            const users = await this.getAllUsers();
            const now = new Date();
            const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            return {
                totalUsers: users.length,
                adminCount: users.filter(u => u.role === 'admin').length,
                customerCount: users.filter(u => u.role === 'customer').length,
                recentUsers: users.filter(u => {
                    const createdAt = new Date(u.createdAt || '2025-01-01');
                    return createdAt > lastMonth;
                }).length
            };
        } catch (error) {
            console.error('Get user stats error:', error);
            return {
                totalUsers: 0,
                adminCount: 0,
                customerCount: 0,
                recentUsers: 0
            };
        }
    }
}

// Export singleton instance
export const adminAuthService = new AdminAuthService();
export default adminAuthService;

// Export debug function
export const checkTableStructure = () => adminAuthService.checkTableStructure();