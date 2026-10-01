const express = require('express');
const router = express.Router();
const controller = require('../controllers/eventRegistrationController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const { publicFormLimiter } = require('../middleware/rateLimiters');

// Public routes - Form doldurma
router.get('/form/:formCode', controller.getEventByFormCode);
router.post('/form/:formCode', publicFormLimiter, controller.submitRegistration);

// Admin routes
router.get('/ticket/:projectionCode', authenticateToken, isAdmin, controller.getEventTicket);
router.get('/event/:eventId', authenticateToken, isAdmin, controller.getEventRegistrations);
router.post('/event/:eventId/toggle-form', authenticateToken, isAdmin, controller.toggleEventForm);
router.delete('/:id', authenticateToken, isAdmin, controller.deleteRegistration);

module.exports = router;
