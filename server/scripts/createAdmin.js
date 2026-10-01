require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = 'Admin';

  if (!email || !password) {
    console.error('HATA: ADMIN_EMAIL ve ADMIN_PASSWORD ortam değişkenleri (.env) tanımlı olmalı.');
    process.exit(1);
  }

  if (password.length < 12) {
    console.error('HATA: ADMIN_PASSWORD en az 12 karakter olmalı.');
    process.exit(1);
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser) {
      // Update role AND reset password to the current .env value
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN', password: hashedPassword }
      });
      console.log('Mevcut kullanıcı ADMIN yapıldı ve şifresi güncellendi:', email);
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'ADMIN'
        }
      });
      console.log('Yeni admin oluşturuldu:', email);
    }

    console.log('\n=== Admin Hazır ===');
    console.log('E-posta:', email);
    console.log('Şifre: (.env dosyasındaki ADMIN_PASSWORD)');
    console.log('===================\n');
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
