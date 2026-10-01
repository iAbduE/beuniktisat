const express = require('express');
const {
  getLinks,
  createLink,
  updateLink,
  deleteLink,
  incrementClicks,
  getAnalytics,
} = require('../controllers/linkController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getLinks);
router.post('/:id/click', incrementClicks);

// Admin routes (Protected)
router.get('/analytics', authenticateToken, isAdmin, getAnalytics);
router.post('/', authenticateToken, isAdmin, createLink);
router.put('/:id', authenticateToken, isAdmin, updateLink);
router.delete('/:id', authenticateToken, isAdmin, deleteLink);

module.exports = router;
