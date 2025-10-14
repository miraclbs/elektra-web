// Soli Oteli için rezervasyon servisi
export interface AvailableDate {
    date: string;
    isAvailable: boolean;
    roomsAvailable: number;
}

export interface Reservation {
    id: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    roomNumber: string;
}

// Soli Oteli bilgileri
const SOLI_HOTEL = {
    name: 'Soli Otel',
    description: 'Konforlu ve modern odalarımızla hizmetinizdeyiz.',
    totalRooms: 20,
    roomNumbers: Array.from({ length: 20 }, (_, i) => `${101 + i}`)
};

// Örnek rezervasyonlar (normalde veritabanından gelecek)
const EXISTING_RESERVATIONS: Reservation[] = [
    {
        id: 'res-1',
        guestName: 'Ahmet Yılmaz',
        checkIn: '2025-10-15',
        checkOut: '2025-10-18',
        roomNumber: '101'
    },
    {
        id: 'res-2',
        guestName: 'Ayşe Demir',
        checkIn: '2025-10-16',
        checkOut: '2025-10-19',
        roomNumber: '102'
    },
    {
        id: 'res-3',
        guestName: 'Mehmet Kaya',
        checkIn: '2025-10-20',
        checkOut: '2025-10-23',
        roomNumber: '103'
    }
];

// Otel bilgilerini getir
export const getHotelInfo = () => {
    return SOLI_HOTEL;
};

// Belirli bir tarih aralığında boş odaları kontrol et
export const checkAvailability = (startDate: string, endDate: string): AvailableDate[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates: AvailableDate[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const reservedRooms = EXISTING_RESERVATIONS.filter(reservation => {
            return dateStr >= reservation.checkIn && dateStr < reservation.checkOut;
        }).length;

        const roomsAvailable = SOLI_HOTEL.totalRooms - reservedRooms;

        dates.push({
            date: dateStr,
            isAvailable: roomsAvailable > 0,
            roomsAvailable
        });
    }

    return dates;
};

// Gelecek 30 gün için müsaitlik durumunu getir
export const getAvailabilityCalendar = (): AvailableDate[] => {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 30);

    return checkAvailability(
        today.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
    );
};

// Rezervasyon yap
export const makeReservation = (guestName: string, checkIn: string, checkOut: string): { success: boolean; message: string; roomNumber?: string } => {
    // Müsaitlik kontrolü
    const availability = checkAvailability(checkIn, checkOut);
    const hasAvailableRoom = availability.every(date => date.isAvailable);

    if (!hasAvailableRoom) {
        return {
            success: false,
            message: 'Seçilen tarihler için müsait oda bulunmamaktadır.'
        };
    }

    // Boş oda numarası bul
    const occupiedRooms = EXISTING_RESERVATIONS
        .filter(res => {
            // Tarih çakışması kontrolü
            return (checkIn < res.checkOut && checkOut > res.checkIn);
        })
        .map(res => res.roomNumber);

    const availableRoomNumber = SOLI_HOTEL.roomNumbers.find(room => !occupiedRooms.includes(room));

    if (!availableRoomNumber) {
        return {
            success: false,
            message: 'Müsait oda bulunamadı.'
        };
    }

    // Rezervasyon oluştur
    const newReservation: Reservation = {
        id: `res-${Date.now()}`,
        guestName,
        checkIn,
        checkOut,
        roomNumber: availableRoomNumber
    };

    EXISTING_RESERVATIONS.push(newReservation);

    return {
        success: true,
        message: `Rezervasyonunuz başarıyla oluşturuldu. Oda numaranız: ${availableRoomNumber}`,
        roomNumber: availableRoomNumber
    };
};

// Mevcut rezervasyonları getir (admin için)
export const getAllReservations = (): Reservation[] => {
    return EXISTING_RESERVATIONS;
};

// Geriye uyumluluk için eski fonksiyonlar (geçici)
export const getRooms = () => {
    return [];
};