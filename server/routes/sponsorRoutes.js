const express = require('express');
const {
  getSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor,
} = require('../controllers/sponsorController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public
router.get('/', getSponsors);

// Admin
router.post('/', authenticateToken, isAdmin, createSponsor);
router.put('/:id', authenticateToken, isAdmin, updateSponsor);
router.delete('/:id', authenticateToken, isAdmin, deleteSponsor);

module.exports = router;
