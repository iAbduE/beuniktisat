# 🚀 BEÜ İktisat - Sunucu Kurulum Rehberi
## Domain: beuniktisat.com

---

## 1️⃣ Sunucu Hazırlığı (Ubuntu 22.04)

```bash
# Sistemi güncelle
sudo apt update && sudo apt upgrade -y

# Gerekli paketleri kur
sudo apt install -y nginx nodejs npm postgresql certbot python3-certbot-nginx git

# Node.js 20 LTS kur (opsiyonel - daha yeni sürüm için)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 kur (Node.js process manager)
sudo npm install -g pm2
```

---

## 2️⃣ PostgreSQL Veritabanı Kurulumu

```bash
# PostgreSQL'e bağlan
sudo -u postgres psql

# Veritabanı ve kullanıcı oluştur
CREATE DATABASE beuniktisat;
CREATE USER beuniktisat_user WITH ENCRYPTED PASSWORD 'GÜÇLÜ_BİR_ŞİFRE';
GRANT ALL PRIVILEGES ON DATABASE beuniktisat TO beuniktisat_user;
\q
```

---

## 3️⃣ Proje Dosyalarını Yükle

```bash
# Proje dizini oluştur
sudo mkdir -p /var/www/beuniktisat
sudo chown -R $USER:$USER /var/www/beuniktisat

# Dosyaları yükle (SCP veya Git ile)
cd /var/www/beuniktisat

# Git ile:
git clone https://github.com/KULLANICI/beuniktisat.git .

# Veya SCP ile (Windows'tan):
# scp -r C:\beuniktisat\* kullanici@sunucu:/var/www/beuniktisat/
```

---

## 4️⃣ Backend Kurulumu

```bash
cd /var/www/beuniktisat/server

# Bağımlılıkları yükle
npm install

# .env dosyası oluştur
cat > .env << EOF
DATABASE_URL="postgresql://beuniktisat_user:GÜÇLÜ_BİR_ŞİFRE@localhost:5432/beuniktisat"
JWT_SECRET="$(openssl rand -base64 32)"
BASE_URL="https://beuniktisat.com"
NODE_ENV="production"
PORT=3000
EOF

# Prisma migrate
npx prisma migrate deploy
npx prisma generate

# Admin kullanıcı oluştur
node scripts/createAdmin.js

# Uploads klasörü izinleri
mkdir -p uploads
chmod 755 uploads

# PM2 ile başlat
pm2 start index.js --name "beuniktisat-api"
pm2 save
pm2 startup
```

---

## 5️⃣ Frontend Build

```bash
cd /var/www/beuniktisat/client

# Bağımlılıkları yükle
npm install

# Production için API URL güncelle
# src/views/*.vue dosyalarındaki localhost:3000 -> beuniktisat.com/api

# Build al
npm run build

# Build çıktısı dist/ klasöründe olacak
```

### API URL Değişikliği (Önemli!)
Tüm Vue dosyalarındaki `http://localhost:3000` adreslerini değiştirmeniz gerekiyor:

```javascript
// Eski:
fetch('http://localhost:3000/api/...')

// Yeni:
fetch('/api/...')  // Relative URL kullanın
```

---

## 6️⃣ Nginx Kurulumu

```bash
# Nginx config dosyasını kopyala
sudo cp /var/www/beuniktisat/nginx/beuniktisat.conf /etc/nginx/sites-available/beuniktisat

# Symlink oluştur
sudo ln -s /etc/nginx/sites-available/beuniktisat /etc/nginx/sites-enabled/

# Default config'i kaldır
sudo rm /etc/nginx/sites-enabled/default

# Config'i test et
sudo nginx -t

# Nginx'i yeniden başlat
sudo systemctl restart nginx
```

---

## 7️⃣ SSL Sertifikası (Let's Encrypt)

```bash
# İlk kurulumda SSL satırlarını yorum yapın (nginx config'de)
# Sonra certbot çalıştırın:

sudo certbot --nginx -d beuniktisat.com -d www.beuniktisat.com

# Otomatik yenileme testi
sudo certbot renew --dry-run
```

---

## 8️⃣ Firewall Ayarları

```bash
# UFW firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status
```

---

## 9️⃣ DNS Ayarları

Domain sağlayıcınızda şu kayıtları ekleyin:

| Tür | İsim | Değer | TTL |
|-----|------|-------|-----|
| A | @ | SUNUCU_IP_ADRESI | 3600 |
| A | www | SUNUCU_IP_ADRESI | 3600 |
| CNAME | www | beuniktisat.com | 3600 |

---

## 🔧 Faydalı Komutlar

```bash
# PM2 durumu
pm2 status
pm2 logs beuniktisat-api
pm2 restart beuniktisat-api

# Nginx
sudo systemctl status nginx
sudo nginx -t
sudo systemctl reload nginx

# Logları izle
sudo tail -f /var/log/nginx/beuniktisat.access.log
sudo tail -f /var/log/nginx/beuniktisat.error.log
```

---

## 🔄 Güncelleme Prosedürü

```bash
cd /var/www/beuniktisat

# Yeni dosyaları çek
git pull

# Backend güncelle
cd server
npm install
npx prisma migrate deploy
pm2 restart beuniktisat-api

# Frontend güncelle
cd ../client
npm install
npm run build
```

---

## ⚠️ Önemli Notlar

1. **Şifreleri değiştirin**: `.env` dosyasındaki şifreleri güçlü yapın
2. **Backup**: PostgreSQL veritabanını düzenli yedekleyin
3. **Monitoring**: PM2 Plus veya benzeri bir servis kullanın
4. **Güvenlik**: Sunucuyu düzenli güncelleyin

---

## 📞 Sorun Giderme

**502 Bad Gateway:**
- PM2 çalışıyor mu? `pm2 status`
- Port 3000 açık mı? `netstat -tlnp | grep 3000`

**SSL Hatası:**
- Sertifika var mı? `sudo certbot certificates`
- Nginx config doğru mu? `sudo nginx -t`

**Resimler Görünmüyor:**
- Uploads klasörü izinleri: `chmod 755 /var/www/beuniktisat/server/uploads`
