const express = require('express');
const router = express.Router();
const qrTrackController = require('../controllers/qrTrackController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Public - QR sayfası ve scan redirect
router.get('/public/:shortCode', qrTrackController.getPublicQrPage);
router.get('/scan/:shortCode', qrTrackController.scanQrCode);

// Admin routes
router.get('/', authenticateToken, isAdmin, qrTrackController.getQrCodes);
router.post('/', authenticateToken, isAdmin, qrTrackController.createQrCode);
router.get('/image/:shortCode', authenticateToken, isAdmin, qrTrackController.getQrImage);
router.get('/stats/:id', authenticateToken, isAdmin, qrTrackController.getQrStats);
router.delete('/:id', authenticateToken, isAdmin, qrTrackController.deleteQrCode);

module.exports = router;
