import { useState } from 'react';
import type { LoginCredentials } from '../types/auth';
import { useAuth } from '../contexts/AuthContext';
import './AuthForm.css';

interface AuthFormProps {
    onClose: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onClose }) => {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Login form state
    const [loginForm, setLoginForm] = useState<LoginCredentials>({
        email: '',
        password: ''
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await login(loginForm);
            setMessage('Giriş başarılı! Yönlendiriliyorsunuz...');
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error: any) {
            setMessage(error.message || 'Giriş bilgileri hatalı. Lütfen kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-overlay">
            <div className="auth-modal">
                <button className="auth-close" onClick={onClose}>✕</button>


                <h2>Giriş Yap</h2>
                <p>Admin tarafından oluşturulan hesabınızla giriş yapın</p>


                {message && (
                    <div className={`auth-message ${message.includes('başarılı') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleLogin} className="auth-form">
                    <div className="input-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={loginForm.email}
                            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                            placeholder="ornek@elektra.com"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Şifre:</label>
                        <input
                            type="password"
                            value={loginForm.password}
                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                            placeholder="Şifrenizi giriniz"
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="auth-submit">
                        {loading ? '⏳ Giriş yapılıyor...' : '🚀 Giriş Yap'}
                    </button>

                    <div className="auth-demo">
                        <p><strong>Test Hesapları:</strong></p>
                        <p>📧 Admin: admin@elektra.com / admin123</p>
                        <p>👤 Müşteri: test@elektra.com / test123</p>
                        <div className="auth-info">
                            <p><em>💡 Yeni hesap için adminle iletişime geçin</em></p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};