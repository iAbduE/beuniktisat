# İktisat Topluluğu Platformu

## Kurulum

### Gereksinimler
- Node.js
- PostgreSQL

### Backend (Sunucu)
1. `server` klasörüne gidin: `cd server`
2. Bağımlılıkları yükleyin: `npm install`
3. `.env` dosyasındaki `DATABASE_URL` bilgisini kendi veritabanınıza göre düzenleyin.
4. Veritabanı şemasını yükleyin: `npx prisma migrate dev` (Veritabanı çalışıyor olmalı)
5. Sunucuyu başlatın: `npm run dev`

### Frontend (İstemci)
1. `client` klasörüne gidin: `cd client`
2. Bağımlılıkları yükleyin: `npm install`
3. Uygulamayı başlatın: `npm run dev`

## Teknoloji Yığını
- **Frontend:** Vue 3, Vite, TailwindCSS, Pinia, Vue Router
- **Backend:** Node.js, Express
- **Veritabanı:** PostgreSQL, Prisma
