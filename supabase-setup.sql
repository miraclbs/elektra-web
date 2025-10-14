-- ElektraWeb Supabase Setup Script
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- 1. UUID extension'ını etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users tablosu
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'customer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bookings tablosu
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id VARCHAR(50) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guest_count INTEGER NOT NULL DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (check_out > check_in),
    CONSTRAINT positive_guests CHECK (guest_count > 0)
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);

-- 5. RLS politikaları
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users tablosu RLS
CREATE POLICY "Users can view own data" ON users
    FOR SELECT
    USING (auth.uid()::text = id::text OR 
           EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Only admins can insert users" ON users
    FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Only admins can update users" ON users
    FOR UPDATE
    USING (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Only admins can delete users" ON users
    FOR DELETE
    USING (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin') 
           AND id::text != auth.uid()::text);

-- Bookings tablosu RLS
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT
    USING (user_id::text = auth.uid()::text OR 
           EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Users can create own bookings" ON bookings
    FOR INSERT
    WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE
    USING (user_id::text = auth.uid()::text OR 
           EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Users can delete own bookings" ON bookings
    FOR DELETE
    USING (user_id::text = auth.uid()::text OR 
           EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- 6. İlk admin kullanıcısını oluştur
INSERT INTO users (name, email, role) 
VALUES ('Elektra Admin', 'admin@elektra.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 7. Test müşteri oluştur
INSERT INTO users (name, email, role) 
VALUES ('Test Müşteri', 'test@elektra.com', 'customer')
ON CONFLICT (email) DO NOTHING;

-- Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;