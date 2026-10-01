const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.recordAttendance = async (req, res) => {
  try {
    const { eventId, qrCode } = req.body;

    // QR kodu veya öğrenci numarası ile üye bul
    const member = await prisma.member.findFirst({
      where: {
        OR: [{ qrCode }, { studentId: qrCode }],
      },
    });

    if (!member) {
      return res.status(404).json({ error: 'Üye bulunamadı.' });
    }

    // Check if already attended
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        memberId: member.id,
        eventId: parseInt(eventId),
      },
    });

    if (existingAttendance) {
      return res.status(400).json({ error: 'Bu üye zaten yoklamaya katılmış.' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        memberId: member.id,
        eventId: parseInt(eventId),
        source: 'ADMIN_SCAN',
      },
    });

    res.status(201).json({ message: 'Yoklama alındı.', member: member.name });
  } catch (error) {
    res.status(500).json({ error: 'Yoklama alınamadı.' });
  }
};

exports.getEventAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;
    const attendances = await prisma.attendance.findMany({
      where: { eventId: parseInt(eventId) },
      include: { member: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(attendances);
  } catch (error) {
    res.status(500).json({ error: 'Yoklama listesi getirilemedi.' });
  }
};
