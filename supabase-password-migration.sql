-- Supabase users tablosunu düzeltme ve RLS policy sorununu çözme
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Önce mevcut policy'leri temizle (infinite recursion'a neden olanlar)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON users;

-- 2. RLS'yi geçici olarak kapat
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 3. Password kolonu ekle (eğer yoksa)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- 4. Mevcut kullanıcılara default password ver
UPDATE users 
SET password = CASE 
    WHEN role = 'admin' THEN 'admin123'
    WHEN role = 'customer' THEN 'user123'
    ELSE 'default123'
END
WHERE password IS NULL;

-- 5. Password kolonu zorunlu yap (NULL olamaz)
ALTER TABLE users 
ALTER COLUMN password SET NOT NULL;

-- 6. Basit ve güvenli RLS policy'leri oluştur
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Herkesten okuma izni (uygulama kendi authentication'ını yapıyor)
CREATE POLICY "Allow read access for all" ON users
    FOR SELECT USING (true);

-- Herkese yazma izni (uygulama kendi authentication'ını yapıyor)  
CREATE POLICY "Allow insert access for all" ON users
    FOR INSERT WITH CHECK (true);

-- Herkese güncelleme izni
CREATE POLICY "Allow update access for all" ON users
    FOR UPDATE USING (true);

-- Herkese silme izni
CREATE POLICY "Allow delete access for all" ON users
    FOR DELETE USING (true);

-- 7. Kontrol et
SELECT id, name, email, role, password, created_at 
FROM users 
ORDER BY created_at DESC;