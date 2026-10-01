const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get site settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await prisma.siteSettings.findFirst();
    
    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          backgroundType: 'gradient',
          backgroundGradient: 'from-blue-900 to-gray-900',
          profileTitle: 'BEÜ İktisat Topluluğu',
          profileSubtitle: 'Ekonomi, Finans ve Gelecek'
        }
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ayarlar getirilemedi.' });
  }
};

// Update site settings
exports.updateSettings = async (req, res) => {
  try {
    const { backgroundType, backgroundColor, backgroundGradient, backgroundImage, profileImage, profileTitle, profileSubtitle } = req.body;
    
    let settings = await prisma.siteSettings.findFirst();
    
    if (settings) {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          backgroundType,
          backgroundColor,
          backgroundGradient,
          backgroundImage,
          profileImage,
          profileTitle,
          profileSubtitle
        }
      });
    } else {
      settings = await prisma.siteSettings.create({
        data: {
          backgroundType,
          backgroundColor,
          backgroundGradient,
          backgroundImage,
          profileImage,
          profileTitle,
          profileSubtitle
        }
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ayarlar güncellenemedi.' });
  }
};
