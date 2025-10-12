import React, { useState } from 'react';
import type { SearchParams } from '../types/hotel';
import './SearchForm.css';

interface SearchFormProps {
    onSearch: (params: SearchParams) => void;
    isLoading?: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading = false }) => {
    const [searchParams, setSearchParams] = useState<SearchParams>({
        destination: 'İstanbul',
        checkIn: '',
        checkOut: '',
        adults: 2,
        children: 0,
        rooms: 1
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchParams.checkIn || !searchParams.checkOut) {
            alert('Lütfen giriş ve çıkış tarihlerini seçiniz.');
            return;
        }

        if (new Date(searchParams.checkIn) >= new Date(searchParams.checkOut)) {
            alert('Çıkış tarihi giriş tarihinden sonra olmalıdır.');
            return;
        }

        onSearch(searchParams);
    };

    const handleInputChange = (field: keyof SearchParams, value: string | number) => {
        setSearchParams(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Get tomorrow's date as minimum checkout date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    return (
        <div className="search-form-container">
            <div className="search-form-header">
                <h1>Otel Ara</h1>
                <p>İdeal oteli bulun ve rezervasyon yapın</p>
            </div>

            <form className="search-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group destination">
                        <label htmlFor="destination">📍 Destinasyon</label>
                        <input
                            id="destination"
                            type="text"
                            value={searchParams.destination}
                            onChange={(e) => handleInputChange('destination', e.target.value)}
                            placeholder="Şehir veya otel adı"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="checkIn">📅 Giriş Tarihi</label>
                        <input
                            id="checkIn"
                            type="date"
                            value={searchParams.checkIn}
                            onChange={(e) => handleInputChange('checkIn', e.target.value)}
                            min={today}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="checkOut">📅 Çıkış Tarihi</label>
                        <input
                            id="checkOut"
                            type="date"
                            value={searchParams.checkOut}
                            onChange={(e) => handleInputChange('checkOut', e.target.value)}
                            min={searchParams.checkIn || tomorrowStr}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="adults">👥 Yetişkin</label>
                        <select
                            id="adults"
                            value={searchParams.adults}
                            onChange={(e) => handleInputChange('adults', parseInt(e.target.value))}
                        >
                            {[1, 2, 3, 4, 5, 6].map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="children">👶 Çocuk</label>
                        <select
                            id="children"
                            value={searchParams.children}
                            onChange={(e) => handleInputChange('children', parseInt(e.target.value))}
                        >
                            {[0, 1, 2, 3, 4].map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="rooms">🏨 Oda Sayısı</label>
                        <select
                            id="rooms"
                            value={searchParams.rooms}
                            onChange={(e) => handleInputChange('rooms', parseInt(e.target.value))}
                        >
                            {[1, 2, 3, 4].map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    className={`search-button ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            Aranıyor...
                        </>
                    ) : (
                        <>
                            🔍 Otel Ara
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};