const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', videoController.getVideos);
router.post('/', authenticateToken, isAdmin, videoController.createVideo);
router.delete('/:id', authenticateToken, isAdmin, videoController.deleteVideo);

module.exports = router;
