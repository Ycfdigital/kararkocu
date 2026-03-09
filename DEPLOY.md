# KararKoçu — Hostinger Deploy Rehberi

## 1. GitHub Repo Oluşturma

```bash
cd kararkocu
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/KULLANICI/kararkocu.git
git push -u origin main
```

---

## 2. MySQL Veritabanı Oluşturma (Hostinger cPanel)

1. cPanel → MySQL Databases
2. Yeni DB: `kararkocu`
3. Yeni kullanıcı: `kararkocu_user` + şifre belirle
4. Kullanıcıya DB üzerinde **TÜM YETKİLERİ** ver

---

## 3. .env Dosyası Hazırlama

Sunucuda `/home/user/kararkocu/.env` dosyası oluşturun:

```env
DATABASE_URL="mysql://kararkocu_user:SIFRE@localhost:3306/kararkocu"
NEXT_PUBLIC_APP_URL="https://kararkocu.ycfdigital.com"
NEXT_PUBLIC_WP_URL="https://ycfdigital.com"
JWT_SECRET="en-az-32-karakter-rastgele-string-buraya"
NODE_ENV="production"
PORT=3000
GEMINI_API_KEY="google-ai-studio-dan-alinacak"
WC_WEBHOOK_SECRET="woocommerce-webhook-gizli-anahtar"
WC_API_URL="https://ycfdigital.com/wp-json/wc/v3"
WC_CONSUMER_KEY="ck_..."
WC_CONSUMER_SECRET="cs_..."
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT="465"
SMTP_USER="noreply@ycfdigital.com"
SMTP_PASS="email-sifreniz"
SMTP_FROM="Karar Koçu <noreply@ycfdigital.com>"
CREDITS_PER_1000_WORDS="10"
```

---

## 4. Hostinger Node.js App Kurulumu

1. **hPanel → Node.js** bölümüne git
2. **Create Application** tıkla
3. Ayarlar:
   - Node.js version: **20.x**
   - Application root: `/home/user/domains/kararkocu.ycfdigital.com/public_html`
   - Application URL: `kararkocu.ycfdigital.com`
   - Application startup file: `server.js`
4. **Kaydet**

---

## 5. Uygulama Kurulumu (SSH)

```bash
# SSH ile bağlan
ssh user@kararkocu.ycfdigital.com

# Proje klasörüne git
cd ~/domains/kararkocu.ycfdigital.com/public_html

# GitHub'dan çek
git clone https://github.com/KULLANICI/kararkocu.git .

# Bağımlılıkları yükle
npm install

# Prisma generate
npx prisma generate

# Veritabanı tablolarını oluştur
npx prisma db push

# Production build
npm run build

# Uygulamayı başlat (Hostinger hPanel'den de yapılabilir)
node server.js
```

---

## 6. WooCommerce Webhook Kurulumu

1. ycfdigital.com → WP Admin → WooCommerce → Ayarlar → Gelişmiş → Webhooks
2. **Webhook Ekle:**
   - Ad: `KararKocu Siparis`
   - Durum: Aktif
   - Konu: **Sipariş tamamlandı**
   - Teslimat URL: `https://kararkocu.ycfdigital.com/api/webhook/woocommerce`
   - Gizli: `.env`'deki `WC_WEBHOOK_SECRET` ile aynı
   - API Sürümü: WP REST API Integration v3

---

## 7. WooCommerce Ürünlerine Kredi Meta Ekleme

Her kredi paketi ürünü için:
1. WP Admin → Ürünler → Ürünü Düzenle
2. **Ürün Verileri → Özel Alanlar** (Custom Fields)
3. Alan adı: `_kararkocu_credits`
4. Değer: `150` (veya 500, 1500 — pakete göre)

---

## 8. İlk Admin Kullanıcısı Oluşturma

```bash
# Prisma Studio ile (geliştirme ortamında)
npx prisma studio

# VEYA direkt SQL:
# users tablosunda role sütununu 'ADMIN' olarak güncelleyin
```

---

## 9. Güncelleme (Sonraki Deploy)

```bash
cd ~/domains/kararkocu.ycfdigital.com/public_html
git pull origin main
npm install
npx prisma db push
npm run build
# hPanel'den uygulamayı restart et
```

---

## PLACEHOLDER Listesi (Canlıya Almadan Önce)

- [ ] `src/app/page.tsx` — Logo görseli ekle
- [ ] `src/app/page.tsx` — WooCommerce paket linkleri
- [ ] `src/app/page.tsx` — Gerçek fiyatlar
- [ ] `src/app/page.tsx` — Footer linkler (gizlilik, kullanım koşulları, WhatsApp)
- [ ] `src/app/login/page.tsx` — WooCommerce pricing sayfası linki
- [ ] `src/app/dashboard/page.tsx` — Kredi satın alma linki
- [ ] `src/app/chat/page.tsx` — Kredi satın alma linki
- [ ] `.env` — Tüm gerçek değerler
- [ ] Prisma — İlk admin kullanıcısı
