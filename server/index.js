const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiters');
const dotenv = require('dotenv');

dotenv.config();

// Güvenlik: JWT secret tanımlı ve yeterince güçlü değilse başlatma
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET tanımlı değil veya çok kısa (min 32 karakter). Sunucu başlatılmıyor.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// nginx arkasında çalışıyor: gerçek IP'yi X-Forwarded-For'dan al (rate-limit için doğru IP)
app.set('trust proxy', 1);

const authRoutes = require('./routes/authRoutes');
const linkRoutes = require('./routes/linkRoutes');
const qrRoutes = require('./routes/qrRoutes');
const eventRoutes = require('./routes/eventRoutes');
const formRoutes = require('./routes/formRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const videoRoutes = require('./routes/videoRoutes');
const socialPostRoutes = require('./routes/socialPostRoutes');
const memberRoutes = require('./routes/memberRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const qrTrackRoutes = require('./routes/qrTrackRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const raffleRoutes = require('./routes/raffleRoutes');
const eventRegistrationRoutes = require('./routes/eventRegistrationRoutes');
const path = require('path');

// Güvenlik başlıkları (CSP'yi kapatıyoruz çünkü SPA'yı bozabilir; nginx tarafında da başlıklar var)
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS: kendi domain'imiz her zaman izinli (NODE_ENV'den bağımsız).
// Ek origin'ler .env içindeki CORS_ORIGIN ile virgülle eklenebilir.
const allowedOrigins = [
  'https://beuniktisat.com',
  'https://www.beuniktisat.com',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : []),
];
// Geliştirme: herhangi bir portta localhost / 127.0.0.1
const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(cors({
  origin: (origin, cb) => {
    // origin yoksa (mobil uygulama, curl, aynı origin isteği) izin ver
    if (!origin || allowedOrigins.includes(origin) || localhostRegex.test(origin)) {
      return cb(null, true);
    }
    // İzinsiz origin: hata FIRLATMA (aksi halde 500 + HTML döner).
    // Sadece CORS başlığı eklenmez; tarayıcı isteği güvenli şekilde engeller.
    return cb(null, false);
  }
}));

app.use(express.json({ limit: '1mb' }));

// Genel hız sınırı: her IP için 15 dakikada 300 istek
app.use('/api/', generalLimiter);

// Statik dosyalar için uploads klasörü
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/social-posts', socialPostRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/qr-track', qrTrackRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/raffles', raffleRoutes);
app.use('/api/registrations', eventRegistrationRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('İktisat Topluluğu API Çalışıyor 🚀');
  });
}

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
