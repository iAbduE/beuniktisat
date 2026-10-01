const QRCode = require('qrcode');

// QR Kod oluştur (Data URL olarak döndür)
const generateQRCode = async (req, res) => {
  const { text, color, width } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'QR kod için metin (text) gereklidir.' });
  }

  try {
    const options = {
      color: {
        dark: color || '#000000',
        light: '#ffffff',
      },
      width: width || 300,
    };

    const qrDataUrl = await QRCode.toDataURL(text, options);
    res.json({ qrDataUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'QR kod oluşturulamadı.' });
  }
};

module.exports = {
  generateQRCode,
};
