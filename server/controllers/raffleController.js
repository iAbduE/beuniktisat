const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Etkinliğe ait tüm çekilişleri getir
exports.getEventRaffles = async (req, res) => {
  try {
    const { eventId } = req.params;
    const raffles = await prisma.raffle.findMany({
      where: { eventId: parseInt(eventId) },
      include: {
        winners: {
          include: { member: true },
          orderBy: { rank: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(raffles);
  } catch (error) {
    console.error('Çekilişler getirilemedi:', error);
    res.status(500).json({ error: 'Çekilişler getirilemedi.' });
  }
};

// Yeni çekiliş oluştur
exports.createRaffle = async (req, res) => {
  try {
    const { eventId, title, description, prizeCount, reserveCount } = req.body;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) }
    });

    if (!event) {
      return res.status(404).json({ error: 'Etkinlik bulunamadı.' });
    }

    const raffle = await prisma.raffle.create({
      data: {
        eventId: parseInt(eventId),
        title,
        description,
        prizeCount: parseInt(prizeCount) || 1,
        reserveCount: parseInt(reserveCount) || 0
      }
    });

    res.status(201).json(raffle);
  } catch (error) {
    console.error('Çekiliş oluşturulamadı:', error);
    res.status(500).json({ error: 'Çekiliş oluşturulamadı.' });
  }
};

// Çekiliş yap - HER ÇAĞRIDA TEK KİŞİ çeker (tek tek açıklama için)
// Body: { count?: number (varsayılan 1), order?: 'WINNERS_FIRST' | 'RESERVES_FIRST' }
exports.drawRaffle = async (req, res) => {
  try {
    const { id } = req.params;
    const order = req.body?.order === 'RESERVES_FIRST' ? 'RESERVES_FIRST' : 'WINNERS_FIRST';
    // Bu çağrıda kaç kişi çekilecek (varsayılan 1)
    let count = parseInt(req.body?.count);
    if (!Number.isInteger(count) || count < 1) count = 1;

    const raffle = await prisma.raffle.findUnique({
      where: { id: parseInt(id) },
      include: { winners: true }
    });

    if (!raffle) {
      return res.status(404).json({ error: 'Çekiliş bulunamadı.' });
    }

    if (raffle.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Bu çekiliş zaten tamamlandı.' });
    }

    // Etkinliğe katılmış üyeleri getir
    const attendances = await prisma.attendance.findMany({
      where: { eventId: raffle.eventId },
      include: { member: true }
    });

    if (attendances.length === 0) {
      return res.status(400).json({ error: 'Bu etkinliğe katılmış üye bulunmuyor.' });
    }

    // Daha önce kazanmış olanları hariç tut
    const previousWinnerIds = raffle.winners.map(w => w.memberId);
    const eligibleAttendances = attendances.filter(
      a => !previousWinnerIds.includes(a.memberId)
    );

    if (eligibleAttendances.length === 0) {
      return res.status(400).json({ error: 'Çekilişe katılabilecek üye kalmadı.' });
    }

    // Kalan slot sayısı
    const totalToSelect = raffle.prizeCount + raffle.reserveCount;
    const remainingSlots = totalToSelect - raffle.winners.length;

    if (remainingSlots <= 0) {
      return res.status(400).json({ error: 'Tüm ödüller ve yedekler belirlendi.' });
    }

    // Bu çağrıda seçilecek kişi: istenen sayı, kalan slot ve uygun üye ile sınırlı
    const toSelectNow = Math.min(count, remainingSlots, eligibleAttendances.length);

    // Şu ana kadar çekilmiş kazanan/yedek sayısı (rank atamak için)
    let winnersDrawn = raffle.winners.filter(w => !w.isReserve).length;
    let reservesDrawn = raffle.winners.filter(w => w.isReserve).length;

    // Rastgele seçim (Fisher-Yates shuffle)
    const shuffled = [...eligibleAttendances];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const picked = shuffled.slice(0, toSelectNow);
    const createdWinners = [];

    for (let i = 0; i < picked.length; i++) {
      // Tür (kazanan/yedek) çekiliş sırasına göre belirlenir.
      // Rank anlamı sabit: kazananlar 1..prizeCount, yedekler prizeCount+1..
      let isReserve;
      let rank;

      if (order === 'RESERVES_FIRST') {
        // Önce yedek slotları doldur, sonra ana kazananlar
        if (reservesDrawn < raffle.reserveCount) {
          isReserve = true;
          rank = raffle.prizeCount + reservesDrawn + 1;
          reservesDrawn++;
        } else {
          isReserve = false;
          rank = winnersDrawn + 1;
          winnersDrawn++;
        }
      } else {
        // WINNERS_FIRST: önce ana kazananlar, sonra yedekler
        if (winnersDrawn < raffle.prizeCount) {
          isReserve = false;
          rank = winnersDrawn + 1;
          winnersDrawn++;
        } else {
          isReserve = true;
          rank = raffle.prizeCount + reservesDrawn + 1;
          reservesDrawn++;
        }
      }

      const winner = await prisma.raffleWinner.create({
        data: {
          raffleId: raffle.id,
          memberId: picked[i].memberId,
          rank,
          isReserve
        },
        include: { member: true }
      });
      createdWinners.push(winner);
    }

    // Tüm slotlar dolduysa çekilişi tamamla
    const totalWinnersNow = raffle.winners.length + createdWinners.length;
    const isCompleted = totalWinnersNow >= totalToSelect;
    if (isCompleted) {
      await prisma.raffle.update({
        where: { id: raffle.id },
        data: { status: 'COMPLETED' }
      });
    }

    const mainWinners = createdWinners.filter(w => !w.isReserve);
    const reserves = createdWinners.filter(w => w.isReserve);

    res.json({
      message: `${createdWinners.length} kişi seçildi!`,
      winners: createdWinners,
      mainWinners,
      reserves,
      isCompleted,
      // Kalan slot sayısı (frontend "sonraki" butonu için)
      remainingSlots: totalToSelect - totalWinnersNow
    });
  } catch (error) {
    console.error('Çekiliş yapılamadı:', error);
    res.status(500).json({ error: 'Çekiliş yapılamadı.' });
  }
};

// Çekilişi sıfırla (kazananları sil)
exports.resetRaffle = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.raffleWinner.deleteMany({
      where: { raffleId: parseInt(id) }
    });

    await prisma.raffle.update({
      where: { id: parseInt(id) },
      data: { status: 'PENDING' }
    });

    res.json({ message: 'Çekiliş sıfırlandı.' });
  } catch (error) {
    console.error('Çekiliş sıfırlanamadı:', error);
    res.status(500).json({ error: 'Çekiliş sıfırlanamadı.' });
  }
};

// Çekilişi sil
exports.deleteRaffle = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.raffle.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Çekiliş silindi.' });
  } catch (error) {
    console.error('Çekiliş silinemedi:', error);
    res.status(500).json({ error: 'Çekiliş silinemedi.' });
  }
};

// Tek bir çekilişi detaylı getir
exports.getRaffle = async (req, res) => {
  try {
    const { id } = req.params;
    const raffle = await prisma.raffle.findUnique({
      where: { id: parseInt(id) },
      include: {
        event: true,
        winners: {
          include: { member: true },
          orderBy: { rank: 'asc' }
        }
      }
    });

    if (!raffle) {
      return res.status(404).json({ error: 'Çekiliş bulunamadı.' });
    }

    res.json(raffle);
  } catch (error) {
    console.error('Çekiliş getirilemedi:', error);
    res.status(500).json({ error: 'Çekiliş getirilemedi.' });
  }
};
