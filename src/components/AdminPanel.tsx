import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import adminAuthService from '../services/adminAuthService';
import type { User } from '../types/auth';
import './AdminPanel.css';

interface AdminPanelProps {
    onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [showCreateUser, setShowCreateUser] = useState(false);

    // Yeni kullanıcı formu
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'customer' as 'admin' | 'customer'
    });

    // Sadece admin kullanıcıları görebilir
    if (!user || user.role !== 'admin') {
        return null;
    }

    useEffect(() => {
        loadUsers();
        // Debug fonksiyonu geçici olarak kapatıldı (RLS infinite recursion sorunu)
        // checkTableStructure();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const userList = await adminAuthService.getAllUsers();
            setUsers(userList);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Kullanıcılar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError('');
            console.log('Creating user with data:', newUser);

            const result = await adminAuthService.createUser(newUser);
            console.log('User creation result:', result);

            // Formu temizle
            setNewUser({
                name: '',
                email: '',
                password: '',
                role: 'customer'
            });

            // Kullanıcı listesini yenile
            await loadUsers();
            setShowCreateUser(false);

            alert('Kullanıcı başarıyla oluşturuldu!');
        } catch (error) {
            console.error('User creation error:', error);
            setError(error instanceof Error ? error.message : 'Kullanıcı oluşturulamadı');
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (window.confirm(`${userName} kullanıcısını silmek istediğinizden emin misiniz?`)) {
            try {
                setError('');
                await adminAuthService.deleteUser(userId);
                await loadUsers(); // Listeyi yenile
                alert('Kullanıcı başarıyla silindi!');
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Kullanıcı silinemedi');
            }
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Bilinmiyor';
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    return (
        <div className="admin-panel-overlay">
            <div className="admin-panel">
                <div className="admin-panel-header">
                    <h2>👨‍💼 Admin Paneli</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="admin-panel-content">
                    {/* Kullanıcı İstatistikleri */}
                    <div className="stats-section">
                        <h3>📊 İstatistikler</h3>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-number">{users.length}</div>
                                <div className="stat-label">Toplam Kullanıcı</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">
                                    {users.filter(u => u.role === 'admin').length}
                                </div>
                                <div className="stat-label">Admin</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">
                                    {users.filter(u => u.role === 'customer').length}
                                </div>
                                <div className="stat-label">Müşteri</div>
                            </div>
                        </div>
                    </div>

                    {/* Kullanıcı Yönetimi */}
                    <div className="users-section">
                        <div className="section-header">
                            <h3>👥 Kullanıcı Yönetimi</h3>
                            <button
                                className="btn-primary"
                                onClick={() => setShowCreateUser(true)}
                            >
                                ➕ Yeni Kullanıcı Ekle
                            </button>
                        </div>

                        {loading ? (
                            <div className="loading">Kullanıcılar yükleniyor...</div>
                        ) : (
                            <div className="users-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Ad</th>
                                            <th>Email</th>
                                            <th>Rol</th>
                                            <th>Kayıt Tarihi</th>
                                            <th>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(userItem => (
                                            <tr key={userItem.id}>
                                                <td>{userItem.name}</td>
                                                <td>{userItem.email}</td>
                                                <td>
                                                    <span className={`role-badge ${userItem.role}`}>
                                                        {userItem.role === 'admin' ? '👨‍💼 Admin' : '👤 Müşteri'}
                                                    </span>
                                                </td>
                                                <td>{formatDate(userItem.createdAt)}</td>
                                                <td>
                                                    {userItem.id !== user.id && (
                                                        <button
                                                            className="btn-danger"
                                                            onClick={() => handleDeleteUser(userItem.id, userItem.name)}
                                                        >
                                                            🗑️ Sil
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Yeni Kullanıcı Modal */}
                {showCreateUser && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <div className="modal-header">
                                <h3>➕ Yeni Kullanıcı Ekle</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => setShowCreateUser(false)}
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleCreateUser} className="user-form">
                                <div className="form-group">
                                    <label>Ad Soyad:</label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        required
                                        placeholder="Kullanıcının tam adı"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email:</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        required
                                        placeholder="ornek@elektra.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Şifre:</label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        required
                                        placeholder="Güvenli şifre"
                                        minLength={6}
                                    />
                                    <small>En az 6 karakter olmalı</small>
                                </div>

                                <div className="form-group">
                                    <label>Rol:</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'customer' })}
                                    >
                                        <option value="customer">👤 Müşteri</option>
                                        <option value="admin">👨‍💼 Admin</option>
                                    </select>
                                </div>

                                <div className="form-actions">
                                    <button type="button" onClick={() => setShowCreateUser(false)}>
                                        İptal
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Kullanıcı Oluştur
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};