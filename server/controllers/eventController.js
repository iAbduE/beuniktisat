const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// Tüm etkinlikleri getir
const getEvents = async (req, res) => {
  const { publicView } = req.query;
  try {
    const isPublicView = publicView === 'true';
    const where = isPublicView ? { isActive: true } : {};
    const events = await prisma.event.findMany({
      where,
      orderBy: { date: 'asc' },
      ...(isPublicView
        ? {
            select: {
              id: true,
              title: true,
              description: true,
              date: true,
              location: true,
              imageUrl: true,
              isActive: true,
            },
          }
        : {}),
    });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Etkinlikler getirilemedi.' });
  }
};

// Yeni etkinlik ekle
const createEvent = async (req, res) => {
  const { title, description, date, location, imageUrl } = req.body;
  try {
    // Eğer dosya yüklendiyse, dosya yolunu kullan
    let finalImageUrl = imageUrl;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        imageUrl: finalImageUrl,
      },
    });
    res.status(201).json(newEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Etkinlik oluşturulamadı.' });
  }
};

// Etkinlik güncelle
const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, date, location, imageUrl, isActive } = req.body;
  try {
    // Mevcut etkinliği al
    const currentEvent = await prisma.event.findUnique({
      where: { id: parseInt(id) }
    });

    // Eğer yeni dosya yüklendiyse
    let finalImageUrl = imageUrl;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
      
      // Eski resmi sil (varsa ve uploads klasöründeyse)
      if (currentEvent?.imageUrl?.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', currentEvent.imageUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        date: date ? new Date(date) : undefined,
        location,
        imageUrl: finalImageUrl,
        isActive: isActive === 'true' || isActive === true,
      },
    });
    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Etkinlik güncellenemedi.' });
  }
};

// Etkinlik sil
const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    // Etkinliği al ve resmini sil
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (event?.imageUrl?.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', event.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await prisma.event.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Etkinlik silindi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Etkinlik silinemedi.' });
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
