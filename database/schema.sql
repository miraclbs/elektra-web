-- ElektraWeb PostgreSQL Database Schema
-- Admin-kontrollü kullanıcı sistemi için

-- UUID extension'ını etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users tablosu (Admin tarafından yönetilir)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'customer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings tablosu (Rezervasyonlar)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id VARCHAR(50) NOT NULL, -- Hotel service'den gelecek room ID
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guest_count INTEGER NOT NULL DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: check_out must be after check_in
    CONSTRAINT valid_dates CHECK (check_out > check_in),
    -- Constraint: guest_count must be positive
    CONSTRAINT positive_guests CHECK (guest_count > 0)
);

-- Audit log tablosu (İsteğe bağlı - admin işlemlerini takip için)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'create_user', 'delete_user', etc.
    target_type VARCHAR(50), -- 'user', 'booking', etc.
    target_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Trigger function: updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers: updated_at alanlarını otomatik güncelle
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) politikaları
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users tablosu için RLS politikaları
-- Herkes kendi bilgilerini görebilir, admin herkesi görebilir
CREATE POLICY "Users can view own data" ON users
    FOR SELECT
    USING (auth.uid()::text = id::text OR 
           EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- Sadece admin kullanıcı oluşturabilir
CREATE POLICY "Only admins can insert users" ON users
    FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- Sadece admin kullanıcı güncelleyebilir
CREATE POLICY "Only admins can update users" ON users
    FOR UPDATE
    USING (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- Sadece admin kullanıcı silebilir (kendi kendini hariç)
CREATE POLICY "Only admins can delete users" ON users
    FOR DELETE
    USING (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin') 
           AND id::text != auth.uid()::text);

-- Bookings tablosu için RLS politikaları
-- Kullanıcılar kendi rezervasyonlarını görebilir, admin hepsini görebilir
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT
    USING (user_id::text = auth.uid()::text OR 
           EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- Kullanıcılar kendi rezervasyonlarını oluşturabilir
CREATE POLICY "Users can create own bookings" ON bookings
    FOR INSERT
    WITH CHECK (user_id::text = auth.uid()::text);

-- Kullanıcılar kendi rezervasyonlarını güncelleyebilir, admin hepsini güncelleyebilir
CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE
    USING (user_id::text = auth.uid()::text OR 
           EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- Kullanıcılar kendi rezervasyonlarını silebilir, admin hepsini silebilir
CREATE POLICY "Users can delete own bookings" ON bookings
    FOR DELETE
    USING (user_id::text = auth.uid()::text OR 
           EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- Audit logs tablosu için RLS politikaları
-- Sadece adminler audit logları görebilir
CREATE POLICY "Only admins can view audit logs" ON audit_logs
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- Sistem audit log'ları oluşturabilir
CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT
    WITH CHECK (true);

-- İlk admin kullanıcısını oluştur
INSERT INTO users (name, email, role) 
VALUES ('Elektra Admin', 'admin@elektra.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Demo müşteri oluştur
INSERT INTO users (name, email, role) 
VALUES ('Demo Müşteri', 'musteri@elektra.com', 'customer')
ON CONFLICT (email) DO NOTHING;

-- Views: Raporlama için yararlı görünümler
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    role,
    COUNT(*) as user_count,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_this_month
FROM users 
GROUP BY role;

CREATE OR REPLACE VIEW booking_stats AS
SELECT 
    status,
    COUNT(*) as booking_count,
    SUM(total_price) as total_revenue,
    AVG(total_price) as average_price,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as recent_bookings
FROM bookings 
GROUP BY status;

-- Functions: Kullanışlı fonksiyonlar
CREATE OR REPLACE FUNCTION get_user_booking_summary(user_uuid UUID)
RETURNS TABLE(
    total_bookings BIGINT,
    total_spent DECIMAL,
    upcoming_bookings BIGINT,
    completed_bookings BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_bookings,
        COALESCE(SUM(total_price), 0) as total_spent,
        COUNT(*) FILTER (WHERE check_in > CURRENT_DATE) as upcoming_bookings,
        COUNT(*) FILTER (WHERE check_out < CURRENT_DATE AND status = 'confirmed') as completed_bookings
    FROM bookings 
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Notification function for new bookings (Supabase realtime için)
CREATE OR REPLACE FUNCTION notify_new_booking()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('new_booking', json_build_object(
        'booking_id', NEW.id,
        'user_id', NEW.user_id,
        'room_id', NEW.room_id,
        'check_in', NEW.check_in,
        'check_out', NEW.check_out,
        'total_price', NEW.total_price
    )::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_notification
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_booking();

-- Cleanup function: Eski iptal edilmiş rezervasyonları temizle
CREATE OR REPLACE FUNCTION cleanup_old_bookings()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM bookings 
    WHERE status = 'cancelled' 
    AND created_at < NOW() - INTERVAL '1 year';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;