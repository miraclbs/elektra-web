import { useState } from 'react';
import { SearchForm } from './components/SearchForm';
import { HotelCard } from './components/HotelCard';
import { HotelService } from './services/hotelService';
import type { SearchParams, HotelSearchResult, SearchFilters } from './types/hotel';
import './App.css';

function App() {
  const [searchResults, setSearchResults] = useState<HotelSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    priceRange: { min: 0, max: 10000 },
    starRating: [],
    amenities: [],
    sortBy: 'price',
    sortOrder: 'asc'
  });

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      const results = await HotelService.searchHotels(params, searchFilters);
      setSearchResults(results);
    } catch (error) {
      console.error('Arama hatası:', error);
      alert('Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHotelSelect = (hotelId: string) => {
    console.log('Seçilen otel ID:', hotelId);
    // Burada otel detay sayfasına yönlendirme yapılabilir
    alert(`Otel ID ${hotelId} seçildi! (Detay sayfası henüz hazır değil)`);
  };

  const handleFilterChange = async (filters: SearchFilters) => {
    setSearchFilters(filters);
    if (hasSearched) {
      setIsLoading(true);
      try {
        // Son arama parametrelerini kullanarak tekrar ara
        const results = await HotelService.searchHotels(
          {
            destination: 'İstanbul',
            checkIn: '',
            checkOut: '',
            adults: 2,
            children: 0,
            rooms: 1
          },
          filters
        );
        setSearchResults(results);
      } catch (error) {
        console.error('Filtreleme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <h1 className="brand">🏨 ElektraWeb Hotels</h1>
            <p className="tagline">En iyi otelleri keşfedin</p>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />

          {hasSearched && (
            <div className="search-results">
              <div className="results-header">
                <div className="results-info">
                  {isLoading ? (
                    <div className="loading-message">
                      <span className="spinner-small"></span>
                      Oteller aranıyor...
                    </div>
                  ) : (
                    <h2>
                      {searchResults.length} otel bulundu
                    </h2>
                  )}
                </div>

                {!isLoading && searchResults.length > 0 && (
                  <div className="sort-controls">
                    <select
                      value={searchFilters.sortBy}
                      onChange={(e) => handleFilterChange({
                        ...searchFilters,
                        sortBy: e.target.value as SearchFilters['sortBy']
                      })}
                      className="sort-select"
                    >
                      <option value="price">Fiyata göre</option>
                      <option value="rating">Yıldıza göre</option>
                      <option value="name">İsme göre</option>
                    </select>

                    <button
                      onClick={() => handleFilterChange({
                        ...searchFilters,
                        sortOrder: searchFilters.sortOrder === 'asc' ? 'desc' : 'asc'
                      })}
                      className="sort-direction"
                    >
                      {searchFilters.sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                )}
              </div>

              <div className="results-grid">
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="hotel-card-skeleton">
                      <div className="skeleton-image"></div>
                      <div className="skeleton-content">
                        <div className="skeleton-line wide"></div>
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line narrow"></div>
                      </div>
                    </div>
                  ))
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <HotelCard
                      key={result.hotel.id}
                      result={result}
                      onSelect={handleHotelSelect}
                    />
                  ))
                ) : (
                  <div className="no-results">
                    <div className="no-results-icon">🏨</div>
                    <h3>Uygun otel bulunamadı</h3>
                    <p>
                      Seçtiğiniz tarihler ve misafir sayısı için uygun otel bulunmamaktadır.
                      Lütfen farklı tarihler deneyiniz veya arama kriterlerinizi değiştiriniz.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!hasSearched && (
            <div className="welcome-section">
              <div className="welcome-content">
                <h2>İdeal otelinizi bulun</h2>
                <p>
                  ElektraWeb ile dünyanın her yerinden binlerce otel arasından
                  size en uygun olanını seçin. En iyi fiyatlar garantili!
                </p>
                <div className="features">
                  <div className="feature">
                    <span className="feature-icon">💰</span>
                    <span>En iyi fiyat garantisi</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">⭐</span>
                    <span>Gerçek müşteri değerlendirmeleri</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">📞</span>
                    <span>7/24 müşteri desteği</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>&copy; 2025 ElektraWeb Hotels. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
