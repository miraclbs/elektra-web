import { useState } from 'react';
import type { User } from '../types/auth';
import './UserProfile.css';

interface UserProfileProps {
    user: User;
    onLogout: () => void;
    onAdminPanel?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, onAdminPanel }) => {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        if (showLogoutConfirm) {
            onLogout();
        } else {
            setShowLogoutConfirm(true);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-info">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-details">
                        <h4>{user.name}</h4>
                        <span className="user-role">{user.role === 'admin' ? 'Yönetici' : 'Müşteri'}</span>
                    </div>
                </div>

                {/* Admin Panel Butonu */}
                {user.role === 'admin' && onAdminPanel && (
                    <button onClick={onAdminPanel} className="admin-panel-btn">
                        👨‍💼 Admin Panel
                    </button>
                )}

                {showLogoutConfirm ? (
                    <div className="logout-confirm">
                        <p>Çıkış yapmak istediğinizden emin misiniz?</p>
                        <div className="logout-actions">
                            <button onClick={onLogout} className="btn-confirm">Evet</button>
                            <button onClick={() => setShowLogoutConfirm(false)} className="btn-cancel">Hayır</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={handleLogout} className="logout-btn">
                        Çıkış Yap
                    </button>
                )}
            </div>
        </div>
    );
};