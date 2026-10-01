const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const prisma = new PrismaClient();

const PUBLIC_URL = (process.env.PUBLIC_URL || 'https://beuniktisat.com').replace(/\/$/, '');

const FONTS = {
  regular: path.join(__dirname, '..', 'assets', 'fonts', 'Roboto-Regular.ttf'),
  medium: path.join(__dirname, '..', 'assets', 'fonts', 'Roboto-Medium.ttf'),
  bold: path.join(__dirname, '..', 'assets', 'fonts', 'Roboto-Bold.ttf'),
  italic: path.join(__dirname, '..', 'assets', 'fonts', 'Roboto-Italic.ttf'),
};

const COLORS = {
  navy: '#1e3a5f',
  gold: '#c9a227',
  ink: '#2d3748',
  muted: '#718096',
  cream: '#fdfcf7',
};

// Content-Disposition başlığı Türkçe karakter kabul etmez; ASCII'ye çevir
const toAsciiFileName = (name) => {
  const map = { ç: 'c', Ç: 'C', ğ: 'g', Ğ: 'G', ı: 'i', İ: 'I', ö: 'o', Ö: 'O', ş: 's', Ş: 'S', ü: 'u', Ü: 'U' };
  return name
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => map[ch] || ch)
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

const drawCertificate = (doc, { memberName, eventTitle, eventDate, verificationCode, qrBuffer }) => {
  const W = doc.page.width;   // 841.89 (A4 yatay)
  const H = doc.page.height;  // 595.28

  // Zemin
  doc.rect(0, 0, W, H).fill(COLORS.cream);

  // Çerçeveler: kalın lacivert dış çerçeve + ince altın iç çerçeve
  doc.lineWidth(3).strokeColor(COLORS.navy).rect(24, 24, W - 48, H - 48).stroke();
  doc.lineWidth(1).strokeColor(COLORS.gold).rect(34, 34, W - 68, H - 68).stroke();

  // Köşe süslemeleri
  const corner = 26;
  const corners = [
    [44, 44, 1, 1],
    [W - 44, 44, -1, 1],
    [44, H - 44, 1, -1],
    [W - 44, H - 44, -1, -1],
  ];
  doc.lineWidth(1.5).strokeColor(COLORS.gold);
  for (const [x, y, dx, dy] of corners) {
    doc.moveTo(x + dx * corner, y).lineTo(x, y).lineTo(x, y + dy * corner).stroke();
  }

  // Üst başlık: topluluk adı
  doc.font(FONTS.medium).fontSize(13).fillColor(COLORS.muted);
  doc.text('BÜLENT ECEVİT ÜNİVERSİTESİ İKTİSAT TOPLULUĞU', 0, 74, {
    align: 'center',
    width: W,
    characterSpacing: 2,
  });

  // Ana başlık
  doc.font(FONTS.bold).fontSize(38).fillColor(COLORS.navy);
  doc.text('KATILIM SERTİFİKASI', 0, 104, {
    align: 'center',
    width: W,
    characterSpacing: 4,
  });

  // Başlık altı altın çizgi
  const ruleW = 220;
  doc.lineWidth(2).strokeColor(COLORS.gold)
    .moveTo((W - ruleW) / 2, 158).lineTo((W + ruleW) / 2, 158).stroke();

  // Giriş metni
  doc.font(FONTS.italic).fontSize(15).fillColor(COLORS.ink);
  doc.text('Bu sertifika', 0, 190, { align: 'center', width: W });

  // Katılımcı adı
  doc.font(FONTS.bold).fontSize(34).fillColor(COLORS.gold);
  doc.text(memberName, 60, 222, { align: 'center', width: W - 120 });

  // İsim altı ince çizgi
  const nameRuleW = Math.min(doc.widthOfString(memberName) + 60, W - 200);
  doc.lineWidth(0.8).strokeColor(COLORS.muted)
    .moveTo((W - nameRuleW) / 2, 270).lineTo((W + nameRuleW) / 2, 270).stroke();

  // Açıklama metni
  const dateStr = new Date(eventDate).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  doc.font(FONTS.regular).fontSize(15).fillColor(COLORS.ink);
  doc.text(`${dateStr} tarihinde düzenlenen`, 0, 294, { align: 'center', width: W });

  // Etkinlik adı
  doc.font(FONTS.bold).fontSize(22).fillColor(COLORS.navy);
  doc.text(`“${eventTitle}”`, 80, 322, { align: 'center', width: W - 160 });

  doc.font(FONTS.regular).fontSize(15).fillColor(COLORS.ink);
  doc.text('etkinliğine katılım sağladığını belgelemektedir.', 0, 360, {
    align: 'center',
    width: W,
  });

  // Alt bölüm: tarih (sol) ve imza (sağ)
  const footY = H - 150;
  const colW = 200;

  doc.lineWidth(0.8).strokeColor(COLORS.ink);
  doc.moveTo(96, footY + 34).lineTo(96 + colW, footY + 34).stroke();
  doc.moveTo(W - 96 - colW, footY + 34).lineTo(W - 96, footY + 34).stroke();

  doc.font(FONTS.medium).fontSize(12).fillColor(COLORS.ink);
  doc.text(dateStr, 96, footY + 42, { align: 'center', width: colW });
  doc.text('BEÜ İktisat Topluluğu', W - 96 - colW, footY + 42, { align: 'center', width: colW });

  doc.font(FONTS.regular).fontSize(9).fillColor(COLORS.muted);
  doc.text('Tarih', 96, footY + 58, { align: 'center', width: colW });
  doc.text('Yönetim Kurulu', W - 96 - colW, footY + 58, { align: 'center', width: colW });

  // QR kod (ortada alt) — doğrulama sayfasına yönlendirir
  if (qrBuffer) {
    const qrSize = 62;
    doc.image(qrBuffer, (W - qrSize) / 2, footY + 8, { width: qrSize, height: qrSize });
    doc.font(FONTS.regular).fontSize(7).fillColor(COLORS.muted);
    doc.text('Doğrulamak için okutun', (W - 120) / 2, footY + 74, { align: 'center', width: 120 });
  }

  // Doğrulama kodu
  doc.font(FONTS.regular).fontSize(8.5).fillColor(COLORS.muted);
  doc.text(`Doğrulama Kodu: ${verificationCode}`, 0, H - 52, {
    align: 'center',
    width: W,
  });
};

// PDF'i üretip response'a stream eder (hem admin hem public rota kullanır)
const streamCertificatePdf = async (res, { member, event, certificate, asAttachment = true }) => {
  const doc = new PDFDocument({
    layout: 'landscape',
    size: 'A4',
    margin: 0,
    info: {
      Title: `Katılım Sertifikası - ${member.name}`,
      Author: 'BEÜ İktisat Topluluğu',
    },
  });

  const asciiName = toAsciiFileName(member.name) || 'Katilimci';
  const fileName = `Sertifika-${asciiName}.pdf`;
  const disposition = asAttachment ? 'attachment' : 'inline';
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `${disposition}; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(`Sertifika-${member.name}.pdf`)}`
  );

  doc.pipe(res);

  // Doğrulama QR'ı üret (hata olsa bile PDF üretimini durdurma)
  let qrBuffer = null;
  try {
    qrBuffer = await QRCode.toBuffer(`${PUBLIC_URL}/dogrula/${certificate.uniqueId}`, {
      margin: 4,
      width: 200,
      color: { dark: '#1e3a5f', light: '#fdfcf7' },
    });
  } catch (e) {
    console.error('QR üretilemedi:', e.message);
  }

  drawCertificate(doc, {
    memberName: member.name,
    eventTitle: event.title,
    eventDate: event.date,
    verificationCode: certificate.uniqueId,
    qrBuffer,
  });

  doc.end();
};

// Sertifikayı bul, yoksa oluştur (yarış koşuluna karşı unique kısıt + fallback)
const findOrCreateCertificate = async (eventId, memberId) => {
  let certificate = await prisma.certificate.findFirst({
    where: { eventId, memberId },
  });
  if (certificate) {
    // Eski bir admin/static QR sertifikası varsa, gerçek EVENT_QR katılımıyla
    // tekrar etkinleştir ve yeni sertifika hakkını bu kayda bağla.
    if (certificate.source !== 'EVENT_QR') {
      return prisma.certificate.update({
        where: { id: certificate.id },
        data: { source: 'EVENT_QR', issueDate: new Date() },
      });
    }
    return certificate;
  }

  try {
    return await prisma.certificate.create({
      data: { eventId, memberId, source: 'EVENT_QR' },
    });
  } catch (error) {
    // Eşzamanlı istek unique kısıta takıldıysa mevcut kaydı getir
    if (error.code === 'P2002') {
      return prisma.certificate.findFirst({ where: { eventId, memberId } });
    }
    throw error;
  }
};

exports.drawCertificate = drawCertificate;
exports.findOrCreateCertificate = findOrCreateCertificate;

// Admin: eventId + memberId ile sertifika üret/indir
exports.generateCertificate = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const memberId = parseInt(req.params.memberId);

    const [event, member] = await Promise.all([
      prisma.event.findUnique({ where: { id: eventId } }),
      prisma.member.findUnique({ where: { id: memberId } }),
    ]);

    if (!event || !member) {
      return res.status(404).json({ error: 'Etkinlik veya üye bulunamadı.' });
    }

    // Sertifika yalnızca bu etkinlikte yoklamaya katılmış üyelere verilebilir
    const attendance = await prisma.attendance.findFirst({
      where: { eventId, memberId, source: 'EVENT_QR' },
    });
    if (!attendance) {
      return res.status(403).json({
        error: 'Bu üye hareketli etkinlik QR kodu ile katılım yapmadı. Sertifika verilemez.',
      });
    }

    const certificate = await findOrCreateCertificate(eventId, memberId);
    await streamCertificatePdf(res, { member, event, certificate });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Sertifika oluşturulamadı.' });
    }
  }
};

// Public: doğrulama kodu (uniqueId) ile sertifika indir — giriş gerektirmez.
// uniqueId tahmin edilemez bir UUID olduğu için kendisi erişim anahtarıdır.
exports.downloadPublicCertificate = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const certificate = await prisma.certificate.findFirst({
      where: { uniqueId, source: 'EVENT_QR' },
      include: { member: true, event: true },
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Sertifika bulunamadı.' });
    }

    await streamCertificatePdf(res, {
      member: certificate.member,
      event: certificate.event,
      certificate,
    });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Sertifika oluşturulamadı.' });
    }
  }
};

// Public: doğrulama koduyla sertifikanın gerçekliğini kontrol et (sadece özet bilgi)
exports.verifyCertificate = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const certificate = await prisma.certificate.findFirst({
      where: { uniqueId, source: 'EVENT_QR' },
      include: {
        member: { select: { name: true } },
        event: { select: { title: true, date: true } },
      },
    });

    if (!certificate) {
      return res.status(404).json({ valid: false, error: 'Sertifika bulunamadı.' });
    }

    res.json({
      valid: true,
      memberName: certificate.member.name,
      eventTitle: certificate.event.title,
      eventDate: certificate.event.date,
      issueDate: certificate.issueDate,
      uniqueId: certificate.uniqueId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ valid: false, error: 'Doğrulama yapılamadı.' });
  }
};
