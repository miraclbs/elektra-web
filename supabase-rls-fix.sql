-- ⚡ SUPABASE RLS FIX - Infinite Recursion Çözümü
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Tüm problematik policy'leri sil
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow read access for all" ON users;
DROP POLICY IF EXISTS "Allow insert access for all" ON users;
DROP POLICY IF EXISTS "Allow update access for all" ON users;
DROP POLICY IF EXISTS "Allow delete access for all" ON users;

-- 2. RLS'yi geçici olarak kapat
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 3. Password kolonu ekle (eğer yoksa)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- 4. Mevcut kullanıcılara default password ver
UPDATE users 
SET password = CASE 
    WHEN role = 'admin' THEN 'admin123'
    WHEN role = 'customer' THEN 'user123'
    ELSE 'default123'
END
WHERE password IS NULL OR password = '';

-- 5. Password kolonu zorunlu yap
ALTER TABLE users ALTER COLUMN password SET NOT NULL;

-- 6. RLS'yi tekrar aç ve basit policy oluştur
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 7. Tek, basit policy - infinite recursion olmadan
CREATE POLICY "simple_all_access" ON users 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 8. Test - kullanıcıları listele
SELECT id, name, email, role, 
       CASE WHEN password IS NOT NULL THEN '***' ELSE 'NULL' END as password_status,
       created_at 
FROM users 
ORDER BY created_at DESC;

-- 9. Test - INSERT kontrolü
INSERT INTO users (name, email, password, role, created_at) 
VALUES ('Test User', 'test@example.com', 'test123', 'customer', NOW())
ON CONFLICT (email) DO NOTHING;