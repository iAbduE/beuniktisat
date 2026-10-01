const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Public: doğrulama koduyla (uniqueId) sertifika indir ve doğrula.
// uniqueId tahmin edilemez bir UUID olduğu için giriş gerektirmez.
router.get('/public/:uniqueId', certificateController.downloadPublicCertificate);
router.get('/verify/:uniqueId', certificateController.verifyCertificate);

// Admin: eventId + memberId ile sertifika üret
router.get('/:eventId/:memberId', authenticateToken, isAdmin, certificateController.generateCertificate);

module.exports = router;
