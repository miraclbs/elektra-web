import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import { UserProfile } from './components/UserProfile';
import { AdminPanel } from './components/AdminPanel';
import './App.css';

function App() {
    const [hotel, setHotel] = useState<any>(null);
    const [rooms, setRooms] = useState<HotelRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);
    const [bookingModal, setBookingModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const { user, logout } = useAuth();

    useEffect(() => {
        const hotelData = getHotelInfo();
        const roomsData = getRooms();
        setHotel(hotelData);
        setRooms(roomsData);
    }, []);

    const handleLoginClick = () => {
        setShowAuthModal(true);
    };

    const makeBooking = (room: HotelRoom) => {
        if (!user) {
            alert('Rezervasyon yapmak için giriş yapmalısınız!');
            handleLoginClick();
            return;
        }

        setSelectedRoom(room);
        setBookingModal(true);
    };

    const confirmBooking = () => {
        if (selectedRoom && user) {
            alert(`Rezervasyon onaylandı!\nOda: ${selectedRoom.name}\nMisafir: ${user.name}\nTarih: ${new Date().toLocaleDateString('tr-TR')}`);
            setBookingModal(false);
            setSelectedRoom(null);
        }
    };

    if (!hotel) return <div className="loading">Yükleniyor...</div>;

    return (
        <div className="App">
            {/* Header */}
            <div className="auth-header">
                <div className="auth-container">
                    <div className="auth-brand">
                        <h2>🏨 Elektra Hotel</h2>
                    </div>
                    <div className="auth-actions">
                        {!user && (
                            <div className="auth-buttons">
                                <button onClick={handleLoginClick} className="btn-auth">
                                    Giriş Yap
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Kullanıcı Paneli - Sağ tarafta */}
            {user && (
                <div className="user-panel-sidebar">
                    <UserProfile
                        user={user}
                        onLogout={logout}
                        onAdminPanel={user.role === 'admin' ? () => setShowAdminPanel(true) : undefined}
                    />
                </div>
            )}

            {/* Ana İçerik */}
            <div className="container">
                {!user ? (
                    <div className="login-required">
                        <div className="login-prompt">
                            <h2>🏨 Elektra Hotel'e Hoş Geldiniz</h2>
                            <p>Otel odalarımızı görüntülemek ve rezervasyon yapmak için lütfen giriş yapın.</p>
                            <button onClick={handleLoginClick} className="btn-login-large">
                                Giriş Yap
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Otel Bilgileri */}
                        {hotel && (
                            <div className="hotel-header">
                                <img src={hotel.images[0]} alt={hotel.name} className="hotel-main-image" />
                                <div className="hotel-info">
                                    <h1>{hotel.name}</h1>
                                    <div className="star-rating">
                                        {'⭐'.repeat(hotel.starRating)}
                                    </div>
                                    <p>{hotel.description}</p>
                                    <p>📍 {hotel.address}, {hotel.city}</p>
                                    <div className="amenities">
                                        {hotel.amenities.map((amenity: string) => (
                                            <span key={amenity} className="amenity">{amenity}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Odalar */}
                        <section className="rooms-section">
                            <h2>Odalarımız</h2>
                            <div className="rooms-grid">
                                {rooms.map(room => (
                                    <div key={room.id} className="room-card">
                                        <img src={room.images[0]} alt={room.name} className="room-image" />
                                        <div className="room-info">
                                            <h3>{room.name}</h3>
                                            <p>{room.description}</p>
                                            <div className="room-details">
                                                <span>👥 {room.maxOccupancy} misafir</span>
                                                <span>📏 {room.size}m²</span>
                                            </div>
                                            <div className="room-footer">
                                                <span className="price">{room.basePrice}₺ / gece</span>
                                                <button
                                                    onClick={() => makeBooking(room)}
                                                    className="btn-book"
                                                >
                                                    Rezervasyon Yap
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </div>

            {/* Modaller */}
            {showAuthModal && (
                <AuthForm
                    onClose={() => setShowAuthModal(false)}
                />
            )}

            {bookingModal && selectedRoom && (
                <div className="modal-overlay" onClick={() => setBookingModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Rezervasyon Onayı</h3>
                        <p><strong>Oda:</strong> {selectedRoom.name}</p>
                        <p><strong>Fiyat:</strong> {selectedRoom.basePrice}₺ / gece</p>
                        <p><strong>Misafir:</strong> {user?.name}</p>
                        <p><strong>Tarih:</strong> {new Date().toLocaleDateString('tr-TR')}</p>
                        <div className="modal-actions">
                            <button onClick={() => setBookingModal(false)} className="btn-cancel">İptal</button>
                            <button onClick={confirmBooking} className="btn-confirm">Onayla</button>
                        </div>
                    </div>
                </div>
            )}

            {showAdminPanel && (
                <AdminPanel onClose={() => setShowAdminPanel(false)} />
            )}
        </div>
    );
}

export default App;