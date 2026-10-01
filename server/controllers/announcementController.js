const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tüm duyuruları getir
const getAnnouncements = async (req, res) => {
  const { publicView } = req.query;
  try {
    const where = publicView === 'true' ? { isActive: true } : {};
    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Duyurular getirilemedi.' });
  }
};

// Yeni duyuru ekle
const createAnnouncement = async (req, res) => {
  const { title, content } = req.body;
  try {
    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        content,
      },
    });
    res.status(201).json(newAnnouncement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Duyuru eklenemedi.' });
  }
};

// Duyuru güncelle
const updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { title, content, isActive } = req.body;
  try {
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
        isActive,
      },
    });
    res.json(updatedAnnouncement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Duyuru güncellenemedi.' });
  }
};

// Duyuru sil
const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.announcement.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Duyuru silindi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Duyuru silinemedi.' });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
