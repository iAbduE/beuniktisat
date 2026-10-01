const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tüm linkleri getir (Admin için hepsi, Public için sadece aktifler)
const getLinks = async (req, res) => {
  const { publicView } = req.query;
  
  try {
    const where = publicView === 'true' ? { isActive: true } : {};
    const links = await prisma.link.findMany({
      where,
      orderBy: { order: 'asc' },
    });
    res.json(links);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Linkler getirilemedi.' });
  }
};

// Yeni link ekle
const createLink = async (req, res) => {
  const { title, url, icon, iconUrl, order } = req.body;
  
  try {
    const newLink = await prisma.link.create({
      data: {
        title,
        url,
        icon,
        iconUrl,
        order: order || 0,
      },
    });
    res.status(201).json(newLink);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Link oluşturulamadı.' });
  }
};

// Link güncelle
const updateLink = async (req, res) => {
  const { id } = req.params;
  const { title, url, icon, iconUrl, order, isActive } = req.body;

  try {
    const updatedLink = await prisma.link.update({
      where: { id: parseInt(id) },
      data: {
        title,
        url,
        icon,
        iconUrl,
        order,
        isActive,
      },
    });
    res.json(updatedLink);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Link güncellenemedi.' });
  }
};

// Link sil
const deleteLink = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.link.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Link silindi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Link silinemedi.' });
  }
};

// Tıklanma sayısını artır
const incrementClicks = async (req, res) => {
  const { id } = req.params;
  const userAgent = req.headers['user-agent'];
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  try {
    const [link] = await prisma.$transaction([
      prisma.link.update({
        where: { id: parseInt(id) },
        data: {
          clicks: { increment: 1 },
        },
      }),
      prisma.click.create({
        data: {
          linkId: parseInt(id),
          userAgent,
          ip,
        },
      }),
    ]);
    res.json(link);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Tıklanma sayısı güncellenemedi.' });
  }
};

// Analitik verilerini getir (Son 7 gün)
const getAnalytics = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const clicks = await prisma.click.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Günlük gruplama
    const dailyClicks = {};
    // Son 7 günün tarihlerini oluştur (boş günler için 0 yazmak amacıyla)
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyClicks[dateStr] = 0;
    }

    clicks.forEach((click) => {
      const date = click.createdAt.toISOString().split('T')[0];
      if (dailyClicks[date] !== undefined) {
        dailyClicks[date]++;
      }
    });

    // Tarihe göre sırala (Eskiden yeniye)
    const sortedData = Object.entries(dailyClicks)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    res.json(sortedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Analitik verileri alınamadı.' });
  }
};

module.exports = {
  getLinks,
  createLink,
  updateLink,
  deleteLink,
  incrementClicks,
  getAnalytics,
};
