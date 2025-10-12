import type { Hotel, Room, HotelSearchResult, SearchParams, SearchFilters } from '../types/hotel';

// Mock hotel data
const mockHotels: Hotel[] = [
    {
        id: '1',
        name: 'Grand Palace Hotel',
        description: 'Lüks bir 5 yıldızlı otel, şehir merkezinde konumlanmış.',
        address: 'Taksim Meydanı No:1',
        city: 'İstanbul',
        country: 'Türkiye',
        starRating: 5,
        images: [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
        ],
        amenities: ['WiFi', 'Spa', 'Fitness Center', 'Pool', 'Restaurant', 'Bar'],
        location: { latitude: 41.0369, longitude: 28.9857 },
        priceRange: { min: 800, max: 1500 }
    },
    {
        id: '2',
        name: 'Boutique Marina Hotel',
        description: 'Deniz manzaralı butik otel, marina yakınında.',
        address: 'Kalamış Marina Caddesi No:45',
        city: 'İstanbul',
        country: 'Türkiye',
        starRating: 4,
        images: [
            'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'
        ],
        amenities: ['WiFi', 'Restaurant', 'Bar', 'Terrace', 'Parking'],
        location: { latitude: 40.9667, longitude: 29.0833 },
        priceRange: { min: 400, max: 800 }
    },
    {
        id: '3',
        name: 'Business Center Hotel',
        description: 'İş dünyasına yakın, modern bir otel.',
        address: 'Levent Mahallesi No:100',
        city: 'İstanbul',
        country: 'Türkiye',
        starRating: 4,
        images: [
            'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
            'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'
        ],
        amenities: ['WiFi', 'Business Center', 'Fitness Center', 'Restaurant'],
        location: { latitude: 41.0814, longitude: 29.0093 },
        priceRange: { min: 300, max: 600 }
    },
    {
        id: '4',
        name: 'Historic Old Town Hotel',
        description: 'Tarihi yarımadada yer alan otantik otel.',
        address: 'Sultanahmet Meydanı No:7',
        city: 'İstanbul',
        country: 'Türkiye',
        starRating: 3,
        images: [
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
            'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800'
        ],
        amenities: ['WiFi', 'Restaurant', 'Terrace', 'Historical Tours'],
        location: { latitude: 41.0086, longitude: 28.9802 },
        priceRange: { min: 200, max: 400 }
    },
    {
        id: '5',
        name: 'Antalya Beach Resort',
        description: 'Sahil kenarında her şey dahil tatil köyü.',
        address: 'Lara Plajı No:1',
        city: 'Antalya',
        country: 'Türkiye',
        starRating: 5,
        images: [
            'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'
        ],
        amenities: ['WiFi', 'Pool', 'Beach', 'Spa', 'All Inclusive', 'Water Sports'],
        location: { latitude: 36.8969, longitude: 30.7133 },
        priceRange: { min: 600, max: 1200 }
    },
    {
        id: '6',
        name: 'Bodrum Castle View Hotel',
        description: 'Bodrum Kalesi manzaralı butik otel.',
        address: 'Marina Caddesi No:23',
        city: 'Bodrum',
        country: 'Türkiye',
        starRating: 4,
        images: [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
        ],
        amenities: ['WiFi', 'Pool', 'Bar', 'Terrace', 'Sea View'],
        location: { latitude: 37.0344, longitude: 27.4305 },
        priceRange: { min: 400, max: 700 }
    },
    {
        id: '7',
        name: 'Ankara Business Hotel',
        description: 'Başkentin kalbinde iş oteli.',
        address: 'Kızılay Meydanı No:15',
        city: 'Ankara',
        country: 'Türkiye',
        starRating: 4,
        images: [
            'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
            'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'
        ],
        amenities: ['WiFi', 'Business Center', 'Restaurant', 'Meeting Rooms'],
        location: { latitude: 39.9334, longitude: 32.8597 },
        priceRange: { min: 250, max: 500 }
    }
];

// Mock room data
const mockRooms: Room[] = [
    {
        id: '1-1',
        hotelId: '1',
        name: 'Deluxe King Room',
        description: 'Şehir manzaralı geniş oda',
        maxOccupancy: 2,
        bedType: 'King',
        size: 35,
        amenities: ['WiFi', 'Minibar', 'Safe', 'Air Conditioning'],
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
        basePrice: 800
    },
    {
        id: '1-2',
        hotelId: '1',
        name: 'Presidential Suite',
        description: 'Lüks süit, panoramik manzara',
        maxOccupancy: 4,
        bedType: 'King + Sofa',
        size: 80,
        amenities: ['WiFi', 'Minibar', 'Safe', 'Air Conditioning', 'Jacuzzi'],
        images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800'],
        basePrice: 1500
    },
    {
        id: '2-1',
        hotelId: '2',
        name: 'Marina View Room',
        description: 'Marina manzaralı oda',
        maxOccupancy: 2,
        bedType: 'Queen',
        size: 28,
        amenities: ['WiFi', 'Minibar', 'Balcony'],
        images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'],
        basePrice: 500
    },
    {
        id: '3-1',
        hotelId: '3',
        name: 'Business Room',
        description: 'İş seyahatleri için ideal',
        maxOccupancy: 2,
        bedType: 'Queen',
        size: 25,
        amenities: ['WiFi', 'Desk', 'Safe'],
        images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800'],
        basePrice: 350
    },
    {
        id: '4-1',
        hotelId: '4',
        name: 'Historic Room',
        description: 'Tarihi dokuyla dekore edilmiş',
        maxOccupancy: 2,
        bedType: 'Double',
        size: 22,
        amenities: ['WiFi', 'Historical Decor'],
        images: ['https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800'],
        basePrice: 250
    },
    {
        id: '5-1',
        hotelId: '5',
        name: 'Deluxe Beach Room',
        description: 'Deniz manzaralı lüks oda',
        maxOccupancy: 3,
        bedType: 'King',
        size: 45,
        amenities: ['WiFi', 'Minibar', 'Balcony', 'Sea View'],
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
        basePrice: 800
    },
    {
        id: '6-1',
        hotelId: '6',
        name: 'Castle View Suite',
        description: 'Kale manzaralı süit',
        maxOccupancy: 4,
        bedType: 'King + Sofa',
        size: 60,
        amenities: ['WiFi', 'Minibar', 'Castle View', 'Terrace'],
        images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800'],
        basePrice: 600
    },
    {
        id: '7-1',
        hotelId: '7',
        name: 'Executive Room',
        description: 'İş adamları için özel oda',
        maxOccupancy: 2,
        bedType: 'Queen',
        size: 30,
        amenities: ['WiFi', 'Desk', 'Safe', 'Business Services'],
        images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800'],
        basePrice: 350
    }
];

// Mock booking data to simulate unavailable dates
const mockBookings = [
    // İstanbul otelleri için rezervasyonlar
    {
        roomId: '1-1', // Grand Palace Hotel - Deluxe King Room
        checkIn: '2025-10-15',
        checkOut: '2025-10-18',
    },
    {
        roomId: '1-2', // Grand Palace Hotel - Presidential Suite
        checkIn: '2025-10-20',
        checkOut: '2025-10-25',
    },
    {
        roomId: '2-1', // Boutique Marina Hotel
        checkIn: '2025-10-16',
        checkOut: '2025-10-19',
    },
    {
        roomId: '3-1', // Business Center Hotel
        checkIn: '2025-10-14',
        checkOut: '2025-10-17',
    },
    {
        roomId: '4-1', // Historic Old Town Hotel
        checkIn: '2025-10-22',
        checkOut: '2025-10-26',
    },
    // Antalya oteli için rezervasyonlar
    {
        roomId: '5-1', // Antalya Beach Resort
        checkIn: '2025-10-18',
        checkOut: '2025-10-22',
    },
    // Bodrum oteli için rezervasyonlar
    {
        roomId: '6-1', // Bodrum Castle View Hotel
        checkIn: '2025-10-13',
        checkOut: '2025-10-16',
    },
    // Ankara oteli için rezervasyonlar
    {
        roomId: '7-1', // Ankara Business Hotel
        checkIn: '2025-10-17',
        checkOut: '2025-10-21',
    }
];

// Helper function to check date availability
const isRoomAvailable = (roomId: string, checkIn: string, checkOut: string): boolean => {
    if (!checkIn || !checkOut) return true; // If no dates specified, assume available

    const requestedCheckIn = new Date(checkIn);
    const requestedCheckOut = new Date(checkOut);

    return !mockBookings.some(booking => {
        if (booking.roomId !== roomId) return false;

        const bookedCheckIn = new Date(booking.checkIn);
        const bookedCheckOut = new Date(booking.checkOut);

        // Check if dates overlap
        return (requestedCheckIn < bookedCheckOut && requestedCheckOut > bookedCheckIn);
    });
};

// Mock service functions
export class HotelService {
    static async searchHotels(params: SearchParams, filters?: SearchFilters): Promise<HotelSearchResult[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Filter hotels based on destination
        let filteredHotels = mockHotels.filter(hotel =>
            hotel.city.toLowerCase().includes(params.destination.toLowerCase()) ||
            hotel.name.toLowerCase().includes(params.destination.toLowerCase()) ||
            hotel.address.toLowerCase().includes(params.destination.toLowerCase())
        );

        // If no destination match found, return empty array
        if (filteredHotels.length === 0) {
            return [];
        }

        let results = filteredHotels.map(hotel => {
            const hotelRooms = mockRooms.filter(room => room.hotelId === hotel.id);

            // Filter rooms based on guest count
            const suitableRooms = hotelRooms.filter(room =>
                room.maxOccupancy >= (params.adults + params.children)
            );

            // Check room availability for the requested dates
            const availableRooms = suitableRooms.filter(room =>
                isRoomAvailable(room.id, params.checkIn, params.checkOut)
            );

            // If no rooms are available for the criteria, return null
            if (availableRooms.length === 0) {
                return null;
            }

            const totalPrice = availableRooms.reduce((sum: number, room: any) => sum + room.basePrice, 0);
            const averagePrice = totalPrice / availableRooms.length;

            // Calculate price based on stay duration
            const checkIn = new Date(params.checkIn);
            const checkOut = new Date(params.checkOut);
            const nights = params.checkIn && params.checkOut ?
                Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 1;

            return {
                hotel,
                availableRooms,
                totalPrice: totalPrice * nights,
                averagePrice: averagePrice * nights,
                availability: availableRooms.map((room: any) => ({
                    roomId: room.id,
                    date: params.checkIn,
                    available: true,
                    price: room.basePrice * nights,
                    currency: 'TRY'
                }))
            };
        }).filter((result): result is HotelSearchResult => result !== null);

        // Apply filters
        if (filters) {
            if (filters.starRating.length > 0) {
                results = results.filter(result =>
                    filters.starRating.includes(result.hotel.starRating)
                );
            }

            if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) {
                results = results.filter(result =>
                    result.averagePrice >= filters.priceRange.min &&
                    result.averagePrice <= filters.priceRange.max
                );
            }

            // Sort results
            results.sort((a, b) => {
                let comparison = 0;
                switch (filters.sortBy) {
                    case 'price':
                        comparison = a.averagePrice - b.averagePrice;
                        break;
                    case 'rating':
                        comparison = a.hotel.starRating - b.hotel.starRating;
                        break;
                    case 'name':
                        comparison = a.hotel.name.localeCompare(b.hotel.name);
                        break;
                    default:
                        comparison = 0;
                }
                return filters.sortOrder === 'desc' ? -comparison : comparison;
            });
        }

        return results;
    }

    static async getHotelById(id: string): Promise<Hotel | null> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockHotels.find(hotel => hotel.id === id) || null;
    }

    static async getRoomsByHotelId(hotelId: string): Promise<Room[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockRooms.filter(room => room.hotelId === hotelId);
    }
}