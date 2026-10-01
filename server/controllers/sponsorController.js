const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tüm sponsorları getir
const getSponsors = async (req, res) => {
  const { publicView } = req.query;
  try {
    const where = publicView === 'true' ? { isActive: true } : {};
    const sponsors = await prisma.sponsor.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(sponsors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sponsorlar getirilemedi.' });
  }
};

// Yeni sponsor ekle
const createSponsor = async (req, res) => {
  const { name, imageUrl, redirectUrl } = req.body;
  try {
    const newSponsor = await prisma.sponsor.create({
      data: {
        name,
        imageUrl,
        redirectUrl,
      },
    });
    res.status(201).json(newSponsor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sponsor eklenemedi.' });
  }
};

// Sponsor güncelle
const updateSponsor = async (req, res) => {
  const { id } = req.params;
  const { name, imageUrl, redirectUrl, isActive } = req.body;
  try {
    const updatedSponsor = await prisma.sponsor.update({
      where: { id: parseInt(id) },
      data: {
        name,
        imageUrl,
        redirectUrl,
        isActive,
      },
    });
    res.json(updatedSponsor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sponsor güncellenemedi.' });
  }
};

// Sponsor sil
const deleteSponsor = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.sponsor.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Sponsor silindi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sponsor silinemedi.' });
  }
};

module.exports = {
  getSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor,
};
