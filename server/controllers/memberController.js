const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getMembers = async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Üyeler getirilemedi.' });
  }
};

exports.createMember = async (req, res) => {
  try {
    const { name, email, studentId, department } = req.body;
    const member = await prisma.member.create({
      data: { name, email, studentId, department },
    });
    res.status(201).json(member);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Bu e-posta veya öğrenci numarası zaten kayıtlı.' });
    }
    res.status(500).json({ error: 'Üye oluşturulamadı.' });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.member.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Üye silindi.' });
  } catch (error) {
    res.status(500).json({ error: 'Üye silinemedi.' });
  }
};

// Public: Öğrenci portalı girişi.
// Öğrenci numarası + e-posta İKİSİ birden eşleşmeli — tek başına numara ile
// başkasının bilgilerine erişim engellenir. Kart linki + tüm sertifikaları döner.
exports.lookupMember = async (req, res) => {
  try {
    const studentId = (req.body.studentId || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();

    if (!studentId || !email) {
      return res.status(400).json({ error: 'Öğrenci numarası ve e-posta zorunludur.' });
    }

    const member = await prisma.member.findFirst({
      where: { studentId, email },
      select: {
        name: true,
        department: true,
        studentId: true,
        qrCode: true,
        isActive: true,
        certificates: {
          where: { source: 'EVENT_QR' },
          orderBy: { issueDate: 'desc' },
          select: {
            uniqueId: true,
            issueDate: true,
            event: { select: { title: true, date: true } },
          },
        },
      },
    });

    if (!member) {
      // Bilgi sızdırmamak için "eşleşme yok" tek mesaj (hangi alanın yanlış olduğunu söyleme)
      return res.status(404).json({
        error: 'Bu öğrenci numarası ve e-posta ile kayıtlı bir üye bulunamadı.',
      });
    }

    res.json({
      name: member.name,
      department: member.department,
      studentId: member.studentId,
      qrCode: member.qrCode,
      isActive: member.isActive,
      certificates: member.certificates.map((c) => ({
        uniqueId: c.uniqueId,
        issueDate: c.issueDate,
        eventTitle: c.event.title,
        eventDate: c.event.date,
      })),
    });
  } catch (error) {
    console.error('Üye sorgulama hatası:', error);
    res.status(500).json({ error: 'Sorgulama yapılamadı.' });
  }
};

exports.getMemberByQr = async (req, res) => {
  try {
    const { qrCode } = req.params;
    const member = await prisma.member.findUnique({
      where: { qrCode },
      // Public kart görünümü: sadece gerekli alanlar, e-posta ifşa edilmez
      select: {
        name: true,
        department: true,
        studentId: true,
        qrCode: true,
        isActive: true,
      },
    });
    if (!member) {
      return res.status(404).json({ error: 'Üye bulunamadı.' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Üye bilgisi alınamadı.' });
  }
};
