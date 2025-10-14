-- Supabase'de İlk Admin Kullanıcısını Oluştur
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. RLS'yi tamamen kapat (infinite recursion çözümü)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Password kolonu varsa, yoksa ekle
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- 3. İlk admin kullanıcısını ekle
INSERT INTO users (name, email, password, role, created_at) 
VALUES ('Elektra Admin', 'admin@elektra.com', 'admin123', 'admin', NOW())
ON CONFLICT (email) DO UPDATE SET 
    password = EXCLUDED.password,
    role = EXCLUDED.role;

-- 4. Test kullanıcısını ekle  
INSERT INTO users (name, email, password, role, created_at) 
VALUES ('Test Müşteri', 'test@elektra.com', 'test123', 'customer', NOW())
ON CONFLICT (email) DO UPDATE SET 
    password = EXCLUDED.password,
    role = EXCLUDED.role;

-- 5. Kullanıcıları kontrol et
SELECT id, name, email, role, 
       CASE WHEN password IS NOT NULL THEN '***' ELSE 'NULL' END as password_status,
       created_at 
FROM users 
ORDER BY created_at DESC;