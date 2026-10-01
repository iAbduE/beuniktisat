const express = require('express');
const router = express.Router();
const socialPostController = require('../controllers/socialPostController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', socialPostController.getSocialPosts);
router.post('/', authenticateToken, isAdmin, socialPostController.createSocialPost);
router.delete('/:id', authenticateToken, isAdmin, socialPostController.deleteSocialPost);

module.exports = router;
