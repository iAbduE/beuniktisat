const express = require('express');
const { register, login } = require('../controllers/authController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Yeni yönetici/kullanıcı hesabı oluşturmak sadece giriş yapmış adminlere açık
router.post('/register', authenticateToken, isAdmin, register);
router.post('/login', login);

module.exports = router;
