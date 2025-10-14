import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { getHotelInfo, getAvailabilityCalendar, makeReservation, type AvailableDate } from './services/soliHotelService';
import { AuthForm } from './components/AuthForm';
import { AdminPanel } from './components/AdminPanel';
import './App.css';

function App() {
    const [hotel, setHotel] = useState<any>(null);
    const [availability, setAvailability] = useState<AvailableDate[]>([]);
    const [selectedDateRange, setSelectedDateRange] = useState({ checkIn: '', checkOut: '' });
    const [reservationResult, setReservationResult] = useState<string>('');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const { user, logout } = useAuth();

    useEffect(() => {
        const hotelData = getHotelInfo();
        setHotel(hotelData);
        
        // İlk yüklemede müsaitlik durumunu getir
        const availabilityData = getAvailabilityCalendar();
        setAvailability(availabilityData);
    }, []);

    const handleLoginClick = () => {
        setShowAuthModal(true);
    };

    const handleDateRangeChange = (checkIn: string, checkOut: string) => {
        setSelectedDateRange({ checkIn, checkOut });
        setReservationResult(''); // Önceki sonucu temizle
    };

    const handleReservation = () => {
        if (!user) {
            alert('Rezervasyon yapmak için giriş yapmalısınız!');
            handleLoginClick();
            return;
        }

        if (!selectedDateRange.checkIn || !selectedDateRange.checkOut) {
            alert('Lütfen giriş ve çıkış tarihlerini seçin!');
            return;
        }

        const result = makeReservation(
            user.name,
            selectedDateRange.checkIn,
            selectedDateRange.checkOut
        );
        
        setReservationResult(result.message);
        
        if (result.success) {
            // Müsaitlik durumunu güncelle
            const updatedAvailability = getAvailabilityCalendar();
            setAvailability(updatedAvailability);
            // Tarih seçimini temizle
            setSelectedDateRange({ checkIn: '', checkOut: '' });
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR');
    };

    if (!hotel) return <div className="loading">Yükleniyor...</div>;

    return (
        <div className="app">
            <div className="auth-header">
                <div className="auth-container">
                    <div className="auth-brand">
                        <h2>🏨 {hotel.name}</h2>
                    </div>
                    <div className="auth-actions">
                        {!user ? (
                            <div className="auth-buttons">
                                <button onClick={handleLoginClick} className="btn-auth">
                                    Giriş Yap
                                </button>
                            </div>
                        ) : (
                            <div className="user-panel-header">
                                <div className="profile-avatar">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="profile-details">
                                    <h4>{user.name}</h4>
                                    <span className="user-role">{user.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}</span>
                                </div>
                                <div className="user-actions">
                                    {user.role === 'admin' && (
                                        <button onClick={() => setShowAdminPanel(true)} className="btn-small admin-btn">
                                            Admin Panel
                                        </button>
                                    )}
                                    <button onClick={logout} className="btn-small logout-btn">
                                        Çıkış
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container">
                {!user ? (
                    <div className="login-required">
                        <div className="login-prompt">
                            <h2>Rezervasyon Sistemi</h2>
                            <p>Oda müsaitlik durumunu görmek ve rezervasyon yapmak için giriş yapmanız gerekmektedir.</p>
                            <button onClick={handleLoginClick} className="btn-login-large">
                                Giriş Yap
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Otel Bilgileri */}
                        <section className="hotel-info">
                            <h1>{hotel.name}</h1>
                            <p>{hotel.description}</p>
                            <p><strong>Toplam Oda Sayısı:</strong> {hotel.totalRooms}</p>
                        </section>

                        {/* Tarih Seçimi */}
                        <section className="date-selection">
                            <h2>Rezervasyon Tarihleri</h2>
                            <div className="date-inputs">
                                <div className="input-group">
                                    <label htmlFor="checkin">Giriş Tarihi</label>
                                    <input
                                        type="date"
                                        id="checkin"
                                        value={selectedDateRange.checkIn}
                                        onChange={(e) => handleDateRangeChange(e.target.value, selectedDateRange.checkOut)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="checkout">Çıkış Tarihi</label>
                                    <input
                                        type="date"
                                        id="checkout"
                                        value={selectedDateRange.checkOut}
                                        onChange={(e) => handleDateRangeChange(selectedDateRange.checkIn, e.target.value)}
                                        min={selectedDateRange.checkIn || new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <button 
                                    onClick={handleReservation}
                                    className="search-btn"
                                    disabled={!selectedDateRange.checkIn || !selectedDateRange.checkOut}
                                >
                                    Rezervasyon Yap
                                </button>
                            </div>
                            {selectedDateRange.checkIn && selectedDateRange.checkOut && (
                                <div className="nights-info">
                                    {Math.ceil((new Date(selectedDateRange.checkOut).getTime() - new Date(selectedDateRange.checkIn).getTime()) / (1000 * 60 * 60 * 24))} gece konaklama
                                </div>
                            )}
                        </section>

                        {/* Rezervasyon Sonucu */}
                        {reservationResult && (
                            <section className="reservation-result">
                                <div className={`result-message ${reservationResult.includes('başarıyla') ? 'success' : 'error'}`}>
                                    <p>{reservationResult}</p>
                                </div>
                            </section>
                        )}

                        {/* Müsaitlik Takvimi */}
                        <section className="availability-section">
                            <h2>Müsaitlik Durumu (Gelecek 30 Gün)</h2>
                            <div className="availability-grid">
                                {availability.map((date) => (
                                    <div key={date.date} className={`availability-card ${date.isAvailable ? 'available' : 'not-available'}`}>
                                        <div className="date">{formatDate(date.date)}</div>
                                        <div className="status">
                                            {date.isAvailable ? (
                                                <span className="available-text">
                                                    ✓ {date.roomsAvailable} oda müsait
                                                </span>
                                            ) : (
                                                <span className="not-available-text">
                                                    ✗ Dolu
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </div>

            {showAuthModal && (
                <AuthForm onClose={() => setShowAuthModal(false)} />
            )}

            {showAdminPanel && (
                <AdminPanel onClose={() => setShowAdminPanel(false)} />
            )}
        </div>
    );
}

export default App;