const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { findOrCreateCertificate } = require('./certificateController');
const prisma = new PrismaClient();

// Hareketli (projeksiyon) QR için kısa ömürlü ticket
const EVENT_TICKET_TTL_SECONDS = 60;

const signEventTicket = (eventId) =>
  jwt.sign({ eventId, type: 'event-ticket' }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: EVENT_TICKET_TTL_SECONDS,
  });

const verifyEventTicket = (token, eventId) => {
  if (!token) return false;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    return payload.type === 'event-ticket' && payload.eventId === eventId;
  } catch {
    return false;
  }
};

// Admin: projeksiyon ekranı için kısa ömürlü katılım ticket'ı üret.
// Yalnızca admin'in tarayıcısı (yansıtma ekranı) bu uca ulaşabilir;
// böylece uzaktaki bir kişi kendi başına geçerli ticket üretemez.
exports.getEventTicket = async (req, res) => {
  try {
    const { projectionCode } = req.params;
    const event = await prisma.event.findUnique({ where: { projectionCode } });

    if (!event) {
      return res.status(404).json({ error: 'Etkinlik bulunamadı.' });
    }
    if (!event.formEnabled) {
      return res.status(400).json({ error: 'Bu etkinlik için kayıt formu aktif değil.' });
    }

    const ticket = signEventTicket(event.id);
    res.json({
      ticket,
      expiresIn: EVENT_TICKET_TTL_SECONDS,
      eventId: event.id,
      eventTitle: event.title,
      formCode: event.formCode,
    });
  } catch (error) {
    console.error('Ticket üretilemedi:', error);
    res.status(500).json({ error: 'Ticket üretilemedi.' });
  }
};

// Public: Form sayfası için etkinlik bilgisini getir
exports.getEventByFormCode = async (req, res) => {
  try {
    const { formCode } = req.params;
    const { ticket } = req.query;
    
    const event = await prisma.event.findUnique({
      where: { formCode },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        location: true,
        imageUrl: true,
        formEnabled: true
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Etkinlik bulunamadı.' });
    }

    if (!event.formEnabled) {
      return res.status(400).json({ error: 'Bu etkinlik için kayıt formu aktif değil.' });
    }

    // Ticket verildiyse doğrula (süresi dolmuş QR için anında geri bildirim)
    if (ticket && !verifyEventTicket(ticket, event.id)) {
      return res.status(401).json({
        error: 'Bu QR kodun süresi doldu. Lütfen etkinlikteki güncel QR kodu okutun.',
      });
    }

    res.json(event);
  } catch (error) {
    console.error('Etkinlik getirilemedi:', error);
    res.status(500).json({ error: 'Etkinlik getirilemedi.' });
  }
};

// Public: Form doldur - Etkinliğe kayıt ol
exports.submitRegistration = async (req, res) => {
  try {
    const { formCode } = req.params;
    const { name, email, studentId, phone, department, ticket } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Ad ve e-posta zorunludur.' });
    }

    // Find event
    const event = await prisma.event.findUnique({
      where: { formCode }
    });

    if (!event) {
      return res.status(404).json({ error: 'Etkinlik bulunamadı.' });
    }

    if (!event.formEnabled) {
      return res.status(400).json({ error: 'Bu etkinlik için kayıt formu aktif değil.' });
    }

    // Statik QR ön kayıt alabilir; yoklama ve sertifika hakkı yalnızca geçerli
    // hareketli QR ticket'ı ile verilir. Süresi dolmuş bir ticket ise reddedilir.
    const hasTicket = Boolean(ticket);
    const hasValidTicket = verifyEventTicket(ticket, event.id);
    if (hasTicket && !hasValidTicket) {
      return res.status(401).json({
        error: 'Bu QR kodun süresi doldu veya geçersiz. Lütfen etkinlikteki güncel QR kodu okutun.',
      });
    }

    // Check if already registered - Email, StudentId veya Phone ile
    // 1. Email kontrolü
    const existingByEmail = await prisma.eventRegistration.findUnique({
      where: {
        eventId_email: {
          eventId: event.id,
          email: email.toLowerCase()
        }
      }
    });

    if (existingByEmail && !hasValidTicket) {
      return res.status(400).json({ error: 'Bu e-posta adresi ile zaten kayıt olunmuş.' });
    }

    // Hareketli QR ile daha önce ön kayıt olmuş kişinin kaydını katılıma yükselt.
    // Yeni ön kayıtlarda öğrenci no/telefon tekrar kontrolleri devam eder.
    if (!existingByEmail && studentId) {
      const existingByStudentId = await prisma.eventRegistration.findFirst({
        where: {
          eventId: event.id,
          studentId: studentId
        }
      });

      if (existingByStudentId) {
        return res.status(400).json({ error: 'Bu öğrenci numarası ile zaten kayıt olunmuş.' });
      }
    }

    // 3. Telefon numarası kontrolü (varsa)
    if (!existingByEmail && phone) {
      // Telefon numarasını normalize et (boşlukları ve özel karakterleri kaldır)
      const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
      const existingByPhone = await prisma.eventRegistration.findFirst({
        where: {
          eventId: event.id,
          phone: {
            contains: normalizedPhone.slice(-10) // Son 10 hane ile karşılaştır
          }
        }
      });

      if (existingByPhone) {
        return res.status(400).json({ error: 'Bu telefon numarası ile zaten kayıt olunmuş.' });
      }
    }

    // Create registration, or reuse the attendee's earlier pre-registration.
    const registration = existingByEmail || await prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        name,
        email: email.toLowerCase(),
        studentId,
        phone,
        department
      }
    });

    // Also create/update Member and add to Attendance for raffle eligibility
    // Önce email ile kontrol et
    let member = await prisma.member.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Email ile bulunamadıysa ve studentId varsa, studentId ile de kontrol et
    if (!member && studentId) {
      member = await prisma.member.findUnique({
        where: { studentId }
      });
      
      // StudentId ile bulunduysa ama email farklıysa, bu kişi zaten üye
      if (member) {
        // Email'i güncelle (eğer mevcut email boş veya farklıysa)
        // Not: Email unique olduğu için, başka birinin email'i varsa hata verir
        try {
          member = await prisma.member.update({
            where: { id: member.id },
            data: { 
              email: email.toLowerCase(),
              name: name // İsmi de güncelle
            }
          });
        } catch (error) {
          if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            return res.status(400).json({ 
              error: 'Bu e-posta adresi zaten başka bir üye tarafından kullanılıyor.' 
            });
          }
          throw error;
        }
      }
    }

    let isNewMember = false;
    let memberUpdateMessage = '';
    
    if (!member) {
      // Yeni üye oluştur
      try {
        member = await prisma.member.create({
          data: {
            name,
            email: email.toLowerCase(),
            studentId: studentId || null,
            department: department || null
          }
        });
        isNewMember = true;
      } catch (error) {
        // StudentId unique olduğu için başka birinde varsa hata verebilir
        if (error.code === 'P2002' && error.meta?.target?.includes('studentId')) {
          return res.status(400).json({ 
            error: 'Bu öğrenci numarası zaten başka bir üye tarafından kullanılıyor.' 
          });
        }
        throw error;
      }
    } else {
      // Mevcut üyenin eksik bilgilerini güncelle (varsa)
      const updateData = {};
      
      // Sadece mevcut değer boşsa güncelle
      if (!member.department && department) {
        updateData.department = department;
        memberUpdateMessage = 'Bölüm bilginiz güncellendi. ';
      }
      
      // StudentId için özel kontrol (unique olduğu için)
      if (!member.studentId && studentId) {
        // Başka birinde bu studentId var mı kontrol et
        const existingStudent = await prisma.member.findUnique({
          where: { studentId }
        });
        
        if (!existingStudent) {
          updateData.studentId = studentId;
          memberUpdateMessage += 'Öğrenci numaranız eklendi. ';
        }
      }
      
      if (Object.keys(updateData).length > 0) {
        member = await prisma.member.update({
          where: { id: member.id },
          data: updateData
        });
      }
    }

    let attendanceRecorded = false;
    let certificateIssued = false;

    if (hasValidTicket) {
      // Yalnızca hareketli QR ticket'ı yoklamayı ve sertifika hakkını başlatır.
      await prisma.attendance.upsert({
        where: {
          memberId_eventId: {
            memberId: member.id,
            eventId: event.id
          }
        },
        create: {
          memberId: member.id,
          eventId: event.id,
          source: 'EVENT_QR',
        },
        update: { source: 'EVENT_QR' } // Ön kaydı gerçek katılıma yükselt
      });
      attendanceRecorded = true;

      // Katılım anında sertifikayı hesapta hazırla.
      try {
        await findOrCreateCertificate(event.id, member.id);
        certificateIssued = true;
      } catch (certError) {
        console.error('Sertifika oluşturulamadı:', certError.message);
      }
    }

    // Mesaj oluştur
    let message = '';
    if (certificateIssued) {
      message = isNewMember
        ? 'Kayıt başarılı! Üyeliğiniz oluşturuldu, katılımınız ve sertifikanız kaydedildi.'
        : `Kayıt başarılı! ${memberUpdateMessage}Katılımınız ve sertifikanız kaydedildi.`;
    } else if (attendanceRecorded) {
      message = 'Katılımınız kaydedildi; sertifika oluşturulurken bir sorun oluştu. Lütfen yönetimle iletişime geçin.';
    } else {
      message = 'Ön kaydınız başarılı. Sertifika için etkinlik sırasında yansıtılan hareketli QR kodu okutmalısınız.';
    }

    res.status(201).json({ 
      message,
      registration,
      isNewMember,
      memberId: member.id,
      attendanceRecorded,
      certificateIssued,
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Bu bilgilerle zaten kayıt var.' });
    }
    
    res.status(500).json({ error: 'Kayıt yapılamadı.' });
  }
};

// Admin: Etkinlik kayıtlarını getir
exports.getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: parseInt(eventId) },
      orderBy: { createdAt: 'desc' }
    });

    res.json(registrations);
  } catch (error) {
    console.error('Kayıtlar getirilemedi:', error);
    res.status(500).json({ error: 'Kayıtlar getirilemedi.' });
  }
};

// Admin: Etkinlik formunu aç/kapat
exports.toggleEventForm = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) }
    });

    if (!event) {
      return res.status(404).json({ error: 'Etkinlik bulunamadı.' });
    }

    const updated = await prisma.event.update({
      where: { id: parseInt(eventId) },
      data: { formEnabled: !event.formEnabled }
    });

    res.json({ 
      message: updated.formEnabled ? 'Form aktif edildi.' : 'Form kapatıldı.',
      formEnabled: updated.formEnabled,
      formCode: updated.formCode
    });
  } catch (error) {
    console.error('Form durumu güncellenemedi:', error);
    res.status(500).json({ error: 'Form durumu güncellenemedi.' });
  }
};

// Admin: Kayıt sil
exports.deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.eventRegistration.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Kayıt silindi.' });
  } catch (error) {
    console.error('Kayıt silinemedi:', error);
    res.status(500).json({ error: 'Kayıt silinemedi.' });
  }
};
