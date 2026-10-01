const rateLimit = require('express-rate-limit');

// Genel API sınırı
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Çok fazla istek gönderildi. Lütfen biraz bekleyin.' }
});

// Giriş/kayıt için sıkı sınır (brute-force koruması)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.' }
});

// Public form gönderimleri (etkinlik kaydı, üyelik başvurusu) için sınır
const publicFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla kayıt denemesi. Lütfen daha sonra tekrar deneyin.' }
});

// Öğrenci portalı sorgusu (studentId + email) için brute-force koruması
const lookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla sorgu denemesi. Lütfen 15 dakika sonra tekrar deneyin.' }
});

module.exports = { generalLimiter, authLimiter, publicFormLimiter, lookupLimiter };
