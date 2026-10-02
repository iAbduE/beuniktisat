# 🎓 BEÜ İktisat Topluluğu — Dijital Yönetim Portalı

BEÜ İktisat Topluluğu için geliştirilmiş, üye yönetimi, etkinlik/yoklama takibi, sertifikalandırma, QR kod sistemleri ve anket gibi süreçleri tek bir platformda toplayan açık kaynak web uygulaması.

> **Kapanış Notu:** Bu portal, seçim sürecinde İktisat Topluluğu üyeleri için bizzat geliştirilip kullanıma sunulmuştur. Seçim sürecinin tamamlanması ve yeni yönetimin belirlenmesi sebebiyle **20 Kasım 2026** tarihi itibarıyla aktif kullanımına son verilmiştir. Altyapıyı kendi kulübünde ücretsiz kullanmak isteyen topluluklar bizimle iletişime geçebilir.

---

## 📌 İçindekiler

- [Özellikler](#-özellikler)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Mimari ve Dizin Yapısı](#-mimari-ve-dizin-yapısı)
- [Kurulum](#-kurulum)
- [Ortam Değişkenleri](#-ortam-değişkenleri)
- [Roller ve Kimlik Doğrulama](#-roller-ve-kimlik-doğrulama)
- [Ön Yüz Sayfaları](#-ön-yüz-sayfaları)
- [API Uç Noktaları](#-api-uç-noktaları)
- [Veritabanı Modelleri](#-veritabanı-modelleri)
- [Yayına Alma (Deploy)](#-yayına-alma-deploy)
- [Güvenlik](#-güvenlik)
- [Lisans ve İletişim](#-lisans-ve-iletişim)

---

## ✨ Özellikler

- **Üye Yönetimi:** Üye kaydı, listeleme, aktif/pasif durumu, öğrenci numarası ve bölüm bilgisi.
- **Etkinlik Yönetimi:** Etkinlik oluşturma, kapak görseli, tarih/konum ve aktife alma.
- **Etkinlik Kayıt Formları:** Her etkinlik için benzersiz `formCode` ile dışa açık kayıt formu; ad, e-posta, telefon, bölüm toplama.
- **Yoklama (QR):** Projeksiyona yansıtılan, belirli aralıklarla yenilenen hareketli QR ile katılım alma. Aynı üyenin mükerrer katılımı veritabanı seviyesinde engellenir.
- **Sertifika Üretimi ve Doğrulama:** Katılıma göre PDF sertifika üretimi (PDFKit) ve herkese açık doğrulama sayfası (`/dogrula/:code`).
- **Dijital Üye Kartı:** QR kodlu dijital kart (`/card/:qrCode`), kare kod ile hızlı kimlik.
- **QR Takip Sistemi:** Özel yönlendirme QR'ları (`/qr-sayfasi/:shortCode`), tarama sayacı ve konum/IP bazlı istatistik.
- **Anket / Çekiliş (Raffle):** Etkinlik bazlı çekiliş, yedek listesi ve kazanan belirleme.
- **Duyurular, Videolar, Sosyal Medya, Sponsorlar:** Ana sayfada yönetilebilir içerik blokları.
- **Kurumsal Site Ayarları:** Arka plan tipi (hareketli shader / düz renk / görsel), profil görseli, başlık ve alt başlık.
- **Link Yönetimi ve Tıklama Analitiği:** Link ekleme, sıralama, tıklanma sayısı ve grafik gösterimi.
- **Güvenli Yönetim Paneli:** JWT korumalı, rol bazlı admin paneli.

---

## 🧰 Teknoloji Yığını

### Ön Yüz (Frontend)
- **Vue 3** (Composition API + `<script setup>`)
- **Vite** (build/dev server)
- **TypeScript**
- **TailwindCSS**
- **Pinia** (state yönetimi)
- **Vue Router** (lazy-load route'lar)
- **Chart.js / vue-chartjs** (analitik grafikleri)
- **qrcode** (QR üretimi), **jsqr** (QR okuma)

### Arka Yüz (Backend)
- **Node.js + Express 5**
- **Prisma ORM 5.22**
- **PostgreSQL**
- **JWT** (jsonwebtoken)
- **bcryptjs** (parola hashleme)
- **Helmet** (güvenlik başlıkları)
- **express-rate-limit** (hız sınırlama)
- **Multer** (dosya yükleme)
- **PDFKit** (sertifika PDF üretimi)
- **qrcode / qrcode-with-logos / canvas** (QR ve görsel üretimi)

### Altyapı
- **Nginx** (reverse proxy + statik dosya + SSL)
- **PM2** (process manager)

---

## 🏗️ Mimari ve Dizin Yapısı

```
beuniktisat/
├── client/                     # Vue 3 ön yüz
│   ├── src/
│   │   ├── components/         # Yeniden kullanılabilir bileşenler (SilkShader, PoweredByAbdusselam, ...)
│   │   ├── config/api.ts       # API taban URL yapılandırması
│   │   ├── router/index.ts     # Rotalar ve auth guard
│   │   ├── stores/auth.ts      # Pinia auth store
│   │   ├── utils/csv.ts        # CSV dışa aktarma
│   │   └── views/              # Sayfalar (Home, Login, StudentPortal, Admin + admin/*)
│   ├── public/                 # Statik varlıklar (favicon, robots.txt, sitemap.xml)
│   └── vite.config.ts
│
├── server/                     # Express API
│   ├── controllers/            # İş mantığı (member, attendance, certificate, raffle, ...)
│   ├── middleware/             # rateLimiters vb.
│   ├── prisma/
│   │   ├── schema.prisma       # Veri modeli
│   │   └── migrations/         # Migrasyonlar
│   ├── routes/                 # REST rotaları
│   ├── scripts/createAdmin.js  # Admin kullanıcı oluşturma
│   ├── index.js                # Uygulama giriş noktası
│   └── package.json
│
├── database/                   # PostgreSQL şema/döküm notları
├── nginx/beuniktisat.conf      # Nginx yapılandırması
├── deploy.ps1                  # Tam deploy script'i
├── deploy-frontend.ps1         # Sadece frontend deploy
├── DEPLOYMENT.md               # Sunucu kurulum rehberi
└── README.md
```

**Akış:** Tarayıcı → Nginx (`/api/*` → Node.js, diğerleri → Vue `dist/`) → Express API → Prisma → PostgreSQL. Yüklenen dosyalar `server/uploads/` altında tutulur ve Nginx üzerinden `/uploads/...` ile sunulur.

---

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ (önerilen 20 LTS)
- PostgreSQL 14+ 
- (Üretim için) Nginx + PM2

### 1) Veritabanı
PostgreSQL'de bir veritabanı oluşturun (örn. `beuniktisat`) ve bağlantı bilgisini `.env`'e yazın.

### 2) Backend

```bash
cd server
npm install
cp .env.example .env      # Windows: copy .env.example .env
# .env dosyasını kendi bilgilerinizle düzenleyin
npx prisma migrate deploy # veya geliştirmede: npx prisma migrate dev
npx prisma generate
node scripts/createAdmin.js
npm run dev               # nodemon ile
```

### 3) Frontend

```bash
cd client
npm install
npm run dev
```

Varsayılan olarak ön yüz `http://localhost:5173`, API `http://localhost:3000` üzerinde çalışır. API adresini `client/src/config/api.ts` üzerinden ayarlayabilirsiniz.

### 4) Üretim build

```bash
cd client
npm run build             # çıktı: client/dist
```

Üretimde Express, `NODE_ENV=production` iken `client/dist` klasörünü de statik olarak sunar; ya da Nginx üzerinden servis edebilirsiniz.

---

## ⚙️ Ortam Değişkenleri

`server/.env` (örnek: `server/.env.example`):

| Değişken | Açıklama |
|---|---|
| `DATABASE_URL` | PostgreSQL bağlantı adresi (Prisma) |
| `PORT` | API portu (varsayılan `3000`) |
| `JWT_SECRET` | **En az 32 karakter** olmalı; yoksa sunucu başlamaz |
| `ADMIN_EMAIL` | Admin giriş e-postası |
| `ADMIN_PASSWORD` | Admin parolası (min. 12 karakter, `createAdmin.js` tarafından okunur) |
| `CORS_ORIGIN` | (Opsiyonel) Virgülle ayrılmış ek izinli origin'ler |

> `NODE_ENV=production` iken `https://beuniktisat.com` ve `https://www.beuniktisat.com` origin'leri otomatik izinlidir; geliştirmede herhangi bir `localhost`/`127.0.0.1` portu izinlidir.

---

## 🔐 Roller ve Kimlik Doğrulama

- **Akış:** `POST /api/auth/login` → JWT döner → ön yüz token'ı `localStorage`'da tutar → korumalı rotalarda `Authorization: Bearer <token>` gönderilir.
- **Roller:** `ADMIN` ve üye/standart kullanıcı. Admin paneli ve projeksiyon ekranı `requiresAuth` + `requiresAdmin` ile korunur.
- **Rota koruması (frontend):** `client/src/router/index.ts` içindeki `beforeEach` guard'ı, token yokluğunda `/login`'e yönlendirir ve token içindeki `role` alanını kontrol eder.

---

## 🖥️ Ön Yüz Sayfaları

| Rota | Sayfa | Açıklama |
|---|---|---|
| `/` | `Home.vue` | Ana sayfa: linkler, duyurular, etkinlikler, sponsorlar, video/sosyal medya + kapanış duyurusu |
| `/login` | `Login.vue` | Yönetici girişi |
| `/admin` | `AdminDashboard.vue` | Yönetim paneli (üye, etkinlik, yoklama, sertifika, QR, çekiliş, ayarlar...) |
| `/belgelerim` | `StudentPortal.vue` | Öğrenci belge portalı (girişsiz erişim) |
| `/card/:qrCode` | `DigitalCard.vue` | Dijital üye kartı |
| `/register/:formCode` | `EventRegistration.vue` | Etkinlik kayıt formu |
| `/dogrula/:code` | `CertificateVerify.vue` | Sertifika doğrulama |
| `/qr-sayfasi/:shortCode` | `QrPage.vue` | Kısa kodlu QR yönlendirme sayfası |
| `/katilim/:projectionCode` | `AttendanceScreen.vue` | Projeksiyon için hareketli QR yoklama ekranı (admin) |

Yönetim paneli alt modülleri: `admin/` altında `MemberManager`, `EventManager`, `AttendanceManager`, `AnnouncementManager`, `LinkManager`, `SponsorManager`, `VideoManager`, `SocialPostManager`, `QrManager`, `QrTrackManager`, `RaffleManager`, `SettingsManager`.

---

## 🌐 API Uç Noktaları

Tümü `/api` öneki altında:

| Yol | Amaç |
|---|---|
| `/api/auth` | Giriş / kimlik doğrulama |
| `/api/links` | Site linkleri ve tıklama kaydı (`/links/:id/click`) |
| `/api/qr` | QR kod üretimi |
| `/api/events` | Etkinlikler |
| `/api/forms` | Form gönderimleri |
| `/api/sponsors` | Sponsorlar |
| `/api/announcements` | Duyurular |
| `/api/videos` | Video galeri |
| `/api/social-posts` | Sosyal medya gönderileri |
| `/api/members` | Üyeler |
| `/api/attendance` | Yoklama |
| `/api/certificates` | Sertifikalar |
| `/api/settings` | Site ayarları |
| `/api/qr-track` | QR takip / istatistik |
| `/api/upload` | Dosya yükleme |
| `/api/raffles` | Çekiliş |
| `/api/registrations` | Etkinlik kayıtları |

> Not: Genel hız sınırı `/api/` için uygulanır; `/api/auth` ayrıca daha sıkı bir limiter ile korunur.

---

## 🗄️ Veritabanı Modelleri

`User`, `Link`, `Click`, `Event`, `EventRegistration`, `FormSubmission`, `Sponsor`, `Announcement`, `Video`, `SocialPost`, `Member`, `Attendance`, `Certificate`, `SiteSettings`, `QrCode`, `QrScan`, `Raffle`, `RaffleWinner`.

---

## ☁️ Yayına Alma (Deploy)

Ayrıntılı adımlar için [`DEPLOYMENT.md`](./DEPLOYMENT.md) dosyasına bakın. Özet:

```powershell
# Yalnızca frontend'i build edip sunucuya at
.\deploy-frontend.ps1 -ServerIP <SUNUCU_IP>

# Frontend + backend + nginx tam deploy
.\deploy.ps1 -ServerIP <SUNUCU_IP> -ServerUser root
```

Sunucu tarafında PM2 ile `beuniktisat-api` süreci çalıştırılır, Nginx `client/dist` klasörünü ve `/api`'yi proxy'ler.

---

## 🛡️ Güvenlik

- `JWT_SECRET` zorunlu ve min. 32 karakter; zayıf/eksikse uygulama başlamaz.
- Parolalar `bcryptjs` ile hashlenir.
- `helmet` güvenlik başlıkları, Nginx tarafında HSTS + ek başlıklar.
- `express-rate-limit` ile genel ve auth bazlı hız sınırı.
- CORS yalnızca izinli origin'lere açıktır.
- `.env` dosyaları ve `uploads/`, `backups/`, üretilen Prisma client gibi klasörler sürüm kontrolüne **dahil edilmez**.

---

## 📄 Lisans ve İletişim

- Lisans: **MIT** (kendi topluluğunda ücretsiz kullanım teşvik edilir).
- İletişim (WhatsApp): **0546 788 07 02** — Abdusselam Nur
- Geliştirici: **Abdusselam Nur**

> Bu altyapıyı kendi öğrenci kulübünde ücretsiz kullanmak isteyen topluluklar iletişime geçebilir.
