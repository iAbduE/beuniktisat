const express = require('express');
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public
router.get('/', getAnnouncements);

// Admin
router.post('/', authenticateToken, isAdmin, createAnnouncement);
router.put('/:id', authenticateToken, isAdmin, updateAnnouncement);
router.delete('/:id', authenticateToken, isAdmin, deleteAnnouncement);

module.exports = router;
