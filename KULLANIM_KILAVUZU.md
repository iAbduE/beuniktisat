# 📘 BEÜ İktisat Topluluğu - Yönetim Paneli Kullanım Kılavuzu

Bu kılavuz, BEÜ İktisat Topluluğu web platformunun yönetim panelini (Admin Dashboard) kullanmak için hazırlanmıştır.

---

## 1. Sisteme Giriş

Yönetim paneline erişmek için tarayıcınızda `/login` sayfasına gidin (Örn: `http://localhost:5173/login`).

**Varsayılan Yönetici Bilgileri:**
- **E-posta:** `admin@beuniktisat.com`
- **Şifre:** `adminpassword`

> ⚠️ **Güvenlik Uyarısı:** İlk girişten sonra şifrenizi değiştirmeniz veya veritabanından güncellemeniz önerilir.

---

## 2. Menü ve Navigasyon

Giriş yaptıktan sonra sol tarafta (veya mobilde üstte) ana menüyü göreceksiniz. Menü başlıkları şunlardır:

- **Dashboard:** Genel bakış ve hızlı istatistikler.
- **Linkler:** Ana sayfadaki bağlantıların yönetimi.
- **Etkinlikler:** Etkinlik oluşturma ve yoklama işlemleri.
- **Duyurular:** Site üzerindeki duyuru bantları.
- **Videolar:** YouTube video galerisi yönetimi.
- **Sosyal Medya:** Instagram/Twitter gönderi paylaşımları.
- **Sponsorlar:** Sponsor logolarının yönetimi.
- **Başvurular:** Üyelik ve gönüllü formlarının takibi.
- **Analitik:** Tıklama ve ziyaretçi istatistikleri.

---

## 3. Modüllerin Kullanımı

### 🔗 Link Yönetimi
Ana sayfada listelenen butonları buradan yönetebilirsiniz.
- **Ekle:** Yeni bir link eklemek için başlık, URL ve (varsa) ikon seçin.
- **Düzenle:** Mevcut linkin bilgilerini güncelleyin.
- **Sırala:** Linkleri sürükle-bırak yöntemiyle yeniden sıralayın.
- **Sil:** Artık kullanılmayan linkleri kaldırın.

### 📅 Etkinlikler ve Yoklama
Topluluk etkinliklerini buradan yönetirsiniz.
1. **Etkinlik Oluştur:** Etkinlik adı, tarihi, konumu ve açıklamasını girin.
2. **Yoklama QR Kodu:** Etkinlik detayına girerek o etkinliğe özel **QR Kodunu** indirin veya ekrana yansıtın.
3. **Yoklama Alma:**
   - Üyeler, kendi dijital kartlarındaki QR kodunu size okutabilir.
   - Veya üyeler, etkinlik için oluşturulan QR kodu kendi telefonlarından taratabilir.
4. **Sertifika:** Etkinlik bittikten sonra katılımcı listesinden "Sertifika İndir" butonuna basarak kişiye özel PDF katılım belgesi oluşturabilirsiniz.

### 📢 İçerik Yönetimi (Duyuru, Video, Sosyal)
- **Duyurular:** Ana sayfanın en üstünde görünen sarı uyarı bantlarıdır. Acil bildirimler için kullanın.
- **Videolar:** YouTube video linkini (URL) yapıştırarak galeriye ekleyin. Sistem otomatik olarak video kapağını çeker.
- **Sosyal Medya:** Instagram veya diğer platformlardaki gönderilerin linklerini ekleyerek "Sosyal Köşe"de görünmesini sağlayın.

### 📝 Başvuru Formları
Web sitesindeki "Üye Ol" veya "Gönüllü Ol" formlarını dolduran kişilerin listesi buraya düşer.
- Başvuruları inceleyebilir, onaylayabilir veya reddedebilirsiniz.
- Listeyi Excel/CSV formatında dışarı aktarabilirsiniz (Gelecek özellik).

### 📊 Analitik
- Hangi linkin kaç kez tıklandığını grafikler üzerinde görün.
- Hangi şehirlerden veya cihazlardan giriş yapıldığını analiz edin.

---

## 4. Dijital Üye Kartı
Her üyenin kendine özel bir dijital kimlik kartı vardır.
- Üyeler `/card/:qrCode` adresinden kartlarına erişebilir.
- Bu kart üzerindeki QR kod, etkinlik girişlerinde yoklama için kullanılır.

---

## 5. Teknik Destek
Sistemle ilgili teknik bir sorun yaşarsanız (Sunucu hatası, sayfa yüklenmemesi vb.) yazılım ekibi ile iletişime geçiniz.

**İyi çalışmalar!** 🚀
