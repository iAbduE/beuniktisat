const express = require('express');
const router = express.Router();
const { generateQRCode } = require('../controllers/qrController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public: QR kod oluştur (Test amaçlı veya dinamik kullanım için)
// Admin koruması eklenebilir, şimdilik açık bırakıyorum veya sadece admin yapabilirim.
// Kullanıcıların kendi QR'larını oluşturması için açık olabilir.
router.post('/generate', authenticateToken, generateQRCode);

module.exports = router;
