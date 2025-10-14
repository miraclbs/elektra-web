# 🚀 ElektraWeb - PostgreSQL ve Supabase Kurulum Rehberi

## 📋 Genel Bakış
Bu proje **admin-kontrollü kullanıcı sistemi** ile PostgreSQL ve Supabase kullanmaktadır.

**Önemli:** Kullanıcılar kendileri kayıt olamazlar! Sadece admin kullanıcıları oluşturabilir ve dağıtabilir.

## 🏗️ Veritabanı Yapısı

### Tablolar
- `users` - Kullanıcı bilgileri (admin tarafından yönetilir)
- `bookings` - Rezervasyon bilgileri
- `audit_logs` - Admin işlem logları (opsiyonel)

### Güvenlik
- Row Level Security (RLS) aktif
- Admin/müşteri rol tabanlı erişim
- Audit logging sistemi

## 🚀 Kurulum Seçenekleri

### Seçenek 1: Supabase (Önerilen)

#### 1. Supabase Projesi Oluşturun
1. [supabase.com](https://supabase.com) adresine gidin
2. Yeni proje oluşturun
3. Database şifrenizi kaydedin

#### 2. Veritabanı Schema'sını Yükleyin
1. Supabase Dashboard > SQL Editor'e gidin
2. `database/schema.sql` dosyasını açın
3. İçeriği kopyalayın ve SQL Editor'e yapıştırın
4. "RUN" butonuna tıklayın

#### 3. Environment Variables'ları Ayarlayın
\`.env\` dosyasını düzenleyin:
\`\`\`env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

#### 4. Supabase API Keys'leri Alın
1. Supabase Dashboard > Settings > API'ye gidin
2. "Project URL" ve "anon public" key'i kopyalayın
3. \`.env\` dosyasına yapıştırın

### Seçenek 2: Yerel PostgreSQL

#### 1. PostgreSQL Kurulumu
\`\`\`bash
# Windows (Chocolatey)
choco install postgresql

# macOS (Homebrew)
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
\`\`\`

#### 2. Veritabanı Oluşturun
\`\`\`sql
createdb elektraweb
psql elektraweb < database/schema.sql
\`\`\`

#### 3. Connection String'i Ayarlayın
\`\`\`env
DATABASE_URL=postgresql://username:password@localhost:5432/elektraweb
\`\`\`

## 👤 Varsayılan Kullanıcılar

### Admin Kullanıcısı
- **Email:** admin@elektra.com
- **Şifre:** admin123
- **Yetkileri:** Tüm kullanıcıları yönetebilir, admin panel erişimi

### Demo Müşteri
- **Email:** musteri@elektra.com
- **Şifre:** musteri (ya da 123456)
- **Yetkileri:** Rezervasyon yapabilir, sadece kendi verilerini görebilir

## 🔧 Kullanım

### 1. Projeyi Başlatın
\`\`\`bash
npm install
npm run dev
\`\`\`

### 2. Admin Girişi Yapın
1. Sayfanın sağ üstünden "Giriş Yap" tıklayın
2. Admin bilgileri ile giriş yapın
3. "👨‍💼 Admin Panel" butonuna tıklayın

### 3. Yeni Kullanıcı Oluşturun
1. Admin Panel'de "➕ Yeni Kullanıcı Ekle" tıklayın
2. Kullanıcı bilgilerini doldurun
3. Rol seçin (Admin/Müşteri)
4. Şifre belirleyin

### 4. Kullanıcıları Yönetin
- Kullanıcı listesini görüntüleyin
- İstatistikleri kontrol edin
- Gerektiğinde kullanıcı silin

## 📊 Admin Panel Özellikleri

- **📈 İstatistikler:** Toplam kullanıcı, admin, müşteri sayıları
- **👥 Kullanıcı Yönetimi:** CRUD işlemleri
- **🔒 Güvenlik:** RLS ile veri koruması
- **📝 Audit Logs:** Tüm admin işlemleri kayıt altında

## 🔐 Güvenlik Özellikleri

### Row Level Security (RLS)
- Kullanıcılar sadece kendi verilerini görebilir
- Adminler tüm verilere erişebilir
- Cascade silme koruması

### Şifre Politikası
- Minimum 6 karakter
- Demo amaçlı basit validasyon
- Üretimde hash'leme kullanılmalı

### Session Yönetimi
- JWT-benzeri token sistemi
- 24 saat geçerlilik
- LocalStorage tabanlı saklama

## 🛠️ Özelleştirme

### Yeni Roller Eklemek
\`\`\`sql
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'customer', 'manager', 'staff'));
\`\`\`

### Ek Tablolar
\`\`\`sql
-- Örnek: Departmanlar tablosu
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    manager_id UUID REFERENCES users(id)
);
\`\`\`

## 🧪 Test Senaryoları

### 1. Admin İşlemleri
- [x] Admin girişi
- [x] Kullanıcı oluşturma
- [x] Kullanıcı silme
- [x] İstatistik görüntüleme

### 2. Müşteri İşlemleri
- [x] Müşteri girişi
- [x] Rezervasyon yapma
- [x] Kendi verilerini görme

### 3. Güvenlik Testleri
- [x] RLS politika kontrolü
- [x] Yetkisiz erişim engelleme
- [x] Session timeout kontrolü

## 📝 Migration Rehberi

### Mevcut Veriden Supabase'e Geçiş
\`\`\`sql
-- Mevcut kullanıcıları aktar
INSERT INTO users (name, email, role)
SELECT name, email, 'customer' FROM old_users_table;

-- Admin kullanıcısını güncelle
UPDATE users SET role = 'admin' 
WHERE email = 'your-admin@example.com';
\`\`\`

## 🚨 Sorun Giderme

### Yaygın Hatalar

#### "Cannot find name 'supabase'"
- \`npm install @supabase/supabase-js\` çalıştırın
- \`.env\` dosyasını kontrol edin

#### "RLS policy violation"
- Kullanıcı rollerini kontrol edin
- Policy'leri yeniden oluşturun

#### "Database connection failed"
- Connection string'i kontrol edin
- Supabase project'in aktif olduğunu doğrulayın

### Debug Modu
\`\`\`javascript
// Console'da debug için
localStorage.setItem('debug', 'true');
\`\`\`

## 📞 Destek

### Geliştirici Notları
- Kod içinde TODO yorumları mevcut
- TypeScript strict mode aktif
- ESLint kuralları uygulanıyor

### Üretim Hazırlığı
- [ ] Environment variables'ları production için güncelleyin
- [ ] HTTPS certificate'ini kurun
- [ ] Database backup'ını ayarlayın
- [ ] Monitoring ve logging'i aktifleştirin

---

## ⭐ Demo Bilgileri

Bu kurulum demo amaçlıdır. Gerçek projeler için:
- Güçlü şifre politikaları uygulayın
- HTTPS kullanın
- Regular backup alın
- Monitoring sistemi kurun
- Rate limiting ekleyin

**Başarılı kurulum için tüm adımları sırasıyla takip edin!** 🎉