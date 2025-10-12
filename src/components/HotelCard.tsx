import React from 'react';
import type { HotelSearchResult } from '../types/hotel';
import './HotelCard.css';

interface HotelCardProps {
    result: HotelSearchResult;
    onSelect: (hotelId: string) => void;
}

export const HotelCard: React.FC<HotelCardProps> = ({ result, onSelect }) => {
    const { hotel, availableRooms, averagePrice } = result;

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
                ⭐
            </span>
        ));
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="hotel-card" onClick={() => onSelect(hotel.id)}>
            <div className="hotel-image">
                <img
                    src={hotel.images[0]}
                    alt={hotel.name}
                    onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x250?text=Hotel+Image';
                    }}
                />
                <div className="hotel-rating">
                    <div className="stars">
                        {renderStars(hotel.starRating)}
                    </div>
                    <span className="rating-text">{hotel.starRating} Yıldız</span>
                </div>
            </div>

            <div className="hotel-content">
                <div className="hotel-header">
                    <h3 className="hotel-name">{hotel.name}</h3>
                    <div className="hotel-location">
                        📍 {hotel.address}, {hotel.city}
                    </div>
                </div>

                <p className="hotel-description">
                    {hotel.description}
                </p>

                <div className="hotel-amenities">
                    {hotel.amenities.slice(0, 4).map((amenity, index) => (
                        <span key={index} className="amenity-tag">
                            {amenity}
                        </span>
                    ))}
                    {hotel.amenities.length > 4 && (
                        <span className="amenity-more">
                            +{hotel.amenities.length - 4} diğer
                        </span>
                    )}
                </div>

                <div className="hotel-rooms">
                    <div className="rooms-info">
                        <span className="rooms-available">
                            {availableRooms.length} oda mevcut
                        </span>
                    </div>
                </div>

                <div className="hotel-footer">
                    <div className="price-info">
                        <div className="price-label">Ortalama fiyat / gece</div>
                        <div className="price-amount">{formatPrice(averagePrice)}</div>
                        <div className="price-note">Vergiler dahil</div>
                    </div>

                    <button className="select-button">
                        Seç ve Devam Et
                        <span className="arrow">→</span>
                    </button>
                </div>
            </div>
        </div>
    );
};