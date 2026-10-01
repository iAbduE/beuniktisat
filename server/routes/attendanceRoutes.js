const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, isAdmin, attendanceController.recordAttendance);
router.get('/event/:eventId', authenticateToken, isAdmin, attendanceController.getEventAttendance);

module.exports = router;
