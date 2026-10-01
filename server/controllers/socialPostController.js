const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getSocialPosts = async (req, res) => {
  try {
    const { publicView } = req.query;
    const where = publicView === 'true' ? { isActive: true } : {};
    const posts = await prisma.socialPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Gönderiler getirilemedi.' });
  }
};

exports.createSocialPost = async (req, res) => {
  try {
    const { url, platform } = req.body;
    const post = await prisma.socialPost.create({
      data: { url, platform: platform || 'INSTAGRAM' },
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Gönderi oluşturulamadı.' });
  }
};

exports.deleteSocialPost = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.socialPost.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Gönderi silindi.' });
  } catch (error) {
    res.status(500).json({ error: 'Gönderi silinemedi.' });
  }
};
