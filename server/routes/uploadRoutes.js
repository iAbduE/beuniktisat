const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const path = require('path');

// Tek dosya yükle
router.post('/', authenticateToken, isAdmin, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya yüklenmedi.' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      message: 'Dosya başarıyla yüklendi.',
      filename: req.file.filename,
      url: fileUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Dosya yüklenemedi.' });
  }
});

// Çoklu dosya yükle
router.post('/multiple', authenticateToken, isAdmin, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Dosya yüklenmedi.' });
    }
    
    const files = req.files.map(file => ({
      filename: file.filename,
      url: `/uploads/${file.filename}`
    }));
    
    res.json({ 
      message: 'Dosyalar başarıyla yüklendi.',
      files: files
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Dosyalar yüklenemedi.' });
  }
});

module.exports = router;
