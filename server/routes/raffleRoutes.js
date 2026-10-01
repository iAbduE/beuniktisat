const express = require('express');
const router = express.Router();
const raffleController = require('../controllers/raffleController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Çekilişleri getir (etkinliğe göre)
router.get('/event/:eventId', authenticateToken, isAdmin, raffleController.getEventRaffles);

// Tek çekiliş detay
router.get('/:id', authenticateToken, isAdmin, raffleController.getRaffle);

// Yeni çekiliş oluştur
router.post('/', authenticateToken, isAdmin, raffleController.createRaffle);

// Çekiliş yap (rastgele kazanan seç)
router.post('/:id/draw', authenticateToken, isAdmin, raffleController.drawRaffle);

// Çekilişi sıfırla
router.post('/:id/reset', authenticateToken, isAdmin, raffleController.resetRaffle);

// Çekiliş sil
router.delete('/:id', authenticateToken, isAdmin, raffleController.deleteRaffle);

module.exports = router;
