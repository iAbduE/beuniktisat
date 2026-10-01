const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const { lookupLimiter } = require('../middleware/rateLimiters');

router.get('/', authenticateToken, isAdmin, memberController.getMembers);
router.post('/', authenticateToken, isAdmin, memberController.createMember);
router.delete('/:id', authenticateToken, isAdmin, memberController.deleteMember);
router.get('/card/:qrCode', memberController.getMemberByQr); // Public: kart görünümü
router.post('/lookup', lookupLimiter, memberController.lookupMember); // Public: öğrenci portalı

module.exports = router;
