const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getVideos = async (req, res) => {
  try {
    const { publicView } = req.query;
    const where = publicView === 'true' ? { isActive: true } : {};
    const videos = await prisma.video.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Videolar getirilemedi.' });
  }
};

exports.createVideo = async (req, res) => {
  try {
    const { title, url } = req.body;
    const video = await prisma.video.create({
      data: { title, url },
    });
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ error: 'Video oluşturulamadı.' });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.video.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Video silindi.' });
  } catch (error) {
    res.status(500).json({ error: 'Video silinemedi.' });
  }
};
