// Hotel booking types based on ElektraWeb API documentation

export interface Hotel {
    id: string;
    name: string;
    description: string;
    address: string;
    city: string;
    country: string;
    starRating: number;
    images: string[];
    amenities: string[];
    location: {
        latitude: number;
        longitude: number;
    };
    priceRange: {
        min: number;
        max: number;
    };
    // API specific fields
    hotelCode?: string;
    chainCode?: string;
    category?: string;
    checkInTime?: string;
    checkOutTime?: string;
    cancellationPolicy?: string;
}

export interface Room {
    id: string;
    hotelId: string;
    name: string;
    description: string;
    maxOccupancy: number;
    bedType: string;
    size: number;
    amenities: string[];
    images: string[];
    basePrice: number;
    // API specific fields
    roomCode?: string;
    roomTypeCode?: string;
    boardType?: string; // BB, HB, FB, AI
    nonRefundable?: boolean;
}

export interface RoomAvailability {
    roomId: string;
    roomCode?: string;
    date: string;
    available: boolean;
    price: number;
    currency: string;
    // API specific fields
    rateKey?: string;
    rateName?: string;
    boardCode?: string;
    boardName?: string;
    cancellationPolicies?: CancellationPolicy[];
    taxes?: Tax[];
    offers?: Offer[];
}

export interface CancellationPolicy {
    amount: number;
    currency: string;
    from: string;
    percent?: number;
}

export interface Tax {
    included: boolean;
    amount: number;
    currency: string;
    type: string;
}

export interface Offer {
    code: string;
    name: string;
    amount: number;
    currency: string;
}

// Yeni basit rezervasyon tipi
export interface BookingData {
    roomId: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    totalPrice: number;
    guestInfo: {
        name: string;
        email: string;
        phone: string;
    };
}

export interface SearchParams {
    destination: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    rooms: number;
}

export interface SearchFilters {
    priceRange: {
        min: number;
        max: number;
    };
    starRating: number[];
    amenities: string[];
    sortBy: 'price' | 'rating' | 'name' | 'distance';
    sortOrder: 'asc' | 'desc';
}

export interface HotelSearchResult {
    hotel: Hotel;
    availableRooms: Room[];
    totalPrice: number;
    averagePrice: number;
    availability: RoomAvailability[];
}

export interface BookingRequest {
    hotelId: string;
    roomId: string;
    checkIn: string;
    checkOut: string;
    guests: {
        adults: number;
        children: number;
    };
    guestDetails: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
}