import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { getHotelInfo, getAvailabilityCalendar, makeReservation, type AvailableDate } from './services/soliHotelService';
import { AuthForm } from './components/AuthForm';
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

  if (!hotel) return <div>Yükleniyor...</div>;

  return (
    <div className="App">
      <div className="auth-header">
        <div className="auth-container">
          <div className="auth-brand">
            <h2>🏨 Elektra Hotel</h2>
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
              <h2>🏨 Elektra Hotel'e Hoş Geldiniz</h2>
              <p>Otel odalarımızı görüntülemek ve rezervasyon yapmak için lütfen giriş yapın.</p>
              <button onClick={handleLoginClick} className="btn-login-large">
                Giriş Yap
              </button>
            </div>
          </div>
        ) : (
          <>
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

            <section className="rooms-section">
              <h2>Odalarımız</h2>
              <div className="rooms-grid">
                {rooms.map(room => (
                  <div key={room.id} className="room-card">
                    <img src={room.images[0]} alt={room.name} className="room-image" />
                    <div className="room-details">
                      <h3>{room.name}</h3>
                      <p className="room-description">{room.description}</p>
                      <div className="room-features">
                        <span>👥 {room.maxOccupancy} kişi</span>
                        <span>📐 {room.size} m²</span>
                      </div>
                      <div className="room-amenities">
                        {room.amenities.map((amenity: string) => (
                          <span key={amenity} className="room-amenity">{amenity}</span>
                        ))}
                      </div>
                      <div className="room-price">
                        <span className="price">{room.basePrice}₺ / gece</span>
                        <button
                          className="book-btn"
                          onClick={() => makeBooking(room)}
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