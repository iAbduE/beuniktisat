const { PrismaClient } = require('@prisma/client');
const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

// Get all QR codes
exports.getQrCodes = async (req, res) => {
  try {
    const qrCodes = await prisma.qrCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { scans: true }
        }
      }
    });
    res.json(qrCodes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'QR kodları getirilemedi.' });
  }
};

// Create a new QR code
exports.createQrCode = async (req, res) => {
  try {
    const { name, targetUrl, logoUrl } = req.body;
    
    const qrCode = await prisma.qrCode.create({
      data: { name, targetUrl, logoUrl }
    });
    
    res.status(201).json(qrCode);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'QR kod oluşturulamadı.' });
  }
};

// Get QR code image
exports.getQrImage = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const qrCode = await prisma.qrCode.findUnique({
      where: { shortCode }
    });
    
    if (!qrCode) {
      return res.status(404).json({ error: 'QR kod bulunamadı.' });
    }
    
    // Generate QR pointing to our redirect endpoint
    const baseUrl = process.env.BASE_URL || 'https://beuniktisat.com';
    const redirectUrl = `${baseUrl}/api/qr-track/scan/${shortCode}`;
    
    // QR kod boyutu
    const size = 400;
    const dotSize = 8; // Her bir nokta boyutu
    
    // Canvas ile özel QR kod oluştur
    const { createCanvas, loadImage } = require('canvas');
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Arka plan beyaz
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // Önce QR veriyi al
    const qrMatrix = await QRCode.create(redirectUrl, {
      errorCorrectionLevel: 'H'
    });
    
    const modules = qrMatrix.modules;
    const moduleCount = modules.size;
    const margin = 4; // ISO/IEC 18004 uyumlu sessiz bölge (iOS 26 kamera tarayıcı için kritik)
    const cellSize = (size - margin * 2 * dotSize) / moduleCount;
    
    // QR modüllerini tam kare olarak çiz.
    // NOT: iOS 26 doğal kamera tarayıcısı yuvarlatılmış "nokta" modülleri
    // okuyamıyor; tam kare + yeterli sessiz bölge güvenli tarama sağlar.
    ctx.fillStyle = '#1e3a8a'; // Koyu mavi
    
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (modules.get(row, col)) {
          const x = margin * dotSize + col * cellSize;
          const y = margin * dotSize + row * cellSize;
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }
    
    // Eğer logo varsa, QR kodun ortasına ekle
    if (qrCode.logoUrl) {
      try {
        // Logo yükle
        let logoPath = qrCode.logoUrl;
        if (logoPath.startsWith('/uploads/')) {
          logoPath = path.join(__dirname, '..', logoPath);
        }
        
        const logo = await loadImage(logoPath);
        
        // Logo boyutu (QR'ın %22'si - iOS 26 güvenli tarama için %30'dan küçültüldü)
        const logoSize = size * 0.22;
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;
        
        // Beyaz arka plan çiz (yuvarlak köşeli kare)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(logoX - 8, logoY - 8, logoSize + 16, logoSize + 16, 16);
        ctx.fill();
        
        // Logo'yu yuvarlak köşeli olarak çiz
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(logoX, logoY, logoSize, logoSize, 12);
        ctx.clip();
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
        ctx.restore();
        
      } catch (logoError) {
        console.error('Logo eklenemedi:', logoError);
      }
    }
    
    const finalImage = canvas.toDataURL('image/png');
    res.json({ qrImage: finalImage, qrCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'QR görsel oluşturulamadı.' });
  }
};

// Public: QR Sayfası için güvenli, sınırlı içerik getir.
// shortCode zaten UUID tabanlıdır; admin istatistikleri ve IP bilgileri dönmez.
exports.getPublicQrPage = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const qrCode = await prisma.qrCode.findUnique({
      where: { shortCode },
      select: {
        name: true,
        targetUrl: true,
        shortCode: true,
        logoUrl: true,
        isActive: true,
      },
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR kod bulunamadı.' });
    }

    let event = null;
    try {
      const target = new URL(qrCode.targetUrl, process.env.PUBLIC_URL || 'https://beuniktisat.com');
      const parts = target.pathname.split('/').filter(Boolean);
      const registerIndex = parts.indexOf('register');
      const formCode = registerIndex >= 0 ? parts[registerIndex + 1] : null;

      if (formCode) {
        event = await prisma.event.findUnique({
          where: { formCode: decodeURIComponent(formCode) },
          select: {
            title: true,
            description: true,
            date: true,
            location: true,
            imageUrl: true,
            formEnabled: true,
          },
        });
      }
    } catch (parseError) {
      // Genel URL'ler etkinlik formu değildir; sayfa genel QR içeriğiyle devam eder.
    }

    res.json({ qrCode, event });
  } catch (error) {
    console.error('Public QR sayfası verisi getirilemedi:', error);
    res.status(500).json({ error: 'QR sayfası yüklenemedi.' });
  }
};

// Track scan and redirect
exports.scanQrCode = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const qrCode = await prisma.qrCode.findUnique({
      where: { shortCode }
    });
    
    if (!qrCode || !qrCode.isActive) {
      return res.status(404).send('QR kod bulunamadı veya deaktif.');
    }
    
    // Record the scan
    await prisma.qrScan.create({
      data: {
        qrCodeId: qrCode.id,
        userAgent: req.headers['user-agent'],
        ip: req.ip
      }
    });
    
    // Update scan count
    await prisma.qrCode.update({
      where: { id: qrCode.id },
      data: { scanCount: { increment: 1 } }
    });
    
    // Redirect to target URL
    res.redirect(qrCode.targetUrl);
  } catch (error) {
    console.error(error);
    res.status(500).send('Hata oluştu.');
  }
};

// Get scan statistics for a QR code
exports.getQrStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const qrCode = await prisma.qrCode.findUnique({
      where: { id: parseInt(id) },
      include: {
        scans: {
          orderBy: { createdAt: 'desc' },
          take: 100
        }
      }
    });
    
    if (!qrCode) {
      return res.status(404).json({ error: 'QR kod bulunamadı.' });
    }
    
    // Group scans by date
    const scansByDate = {};
    qrCode.scans.forEach(scan => {
      const date = scan.createdAt.toISOString().split('T')[0];
      scansByDate[date] = (scansByDate[date] || 0) + 1;
    });
    
    res.json({
      qrCode,
      totalScans: qrCode.scanCount,
      scansByDate,
      recentScans: qrCode.scans.slice(0, 10)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'İstatistikler getirilemedi.' });
  }
};

// Delete QR code
exports.deleteQrCode = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.qrCode.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'QR kod silindi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'QR kod silinemedi.' });
  }
};
