const express = require('express');
const {
  submitForm,
  getSubmissions,
  updateSubmissionStatus,
  deleteSubmission,
} = require('../controllers/formController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const { publicFormLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// Public
router.post('/submit', publicFormLimiter, submitForm);

// Admin
router.get('/', authenticateToken, isAdmin, getSubmissions);
router.put('/:id/status', authenticateToken, isAdmin, updateSubmissionStatus);
router.delete('/:id', authenticateToken, isAdmin, deleteSubmission);

module.exports = router;
