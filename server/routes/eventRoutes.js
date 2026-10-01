const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer config for event images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Sadece resim dosyaları yüklenebilir!'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Public
router.get('/', getEvents);

// Admin
router.post('/', authenticateToken, isAdmin, upload.single('image'), createEvent);
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), updateEvent);
router.delete('/:id', authenticateToken, isAdmin, deleteEvent);

module.exports = router;
