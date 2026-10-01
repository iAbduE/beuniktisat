# 🚀 İktisat Topluluğu Platformu - Yol Haritası

Bu belge, İktisat Topluluğu için geliştirilecek olan Linktree benzeri, gelişmiş yönetim panelli ve topluluk odaklı web platformunun geliştirme sürecini kapsar.

**Teknoloji Yığını:**
- **Frontend:** Vue 3 + Vite + Pinia + Vue Router + TailwindCSS (Önerilen)
- **Backend:** Node.js (Express)
- **Veritabanı:** PostgreSQL
- **ORM:** Prisma

---

## 📅 Faz 1: Proje Kurulumu ve Altyapı (Temel Atma)
Bu aşamada projenin iskeleti oluşturulacak ve veritabanı bağlantıları sağlanacak.

- [x] **Proje Yapısının Oluşturulması**
  - Frontend (Vue 3 + Vite) kurulumu.
  - Backend (Node.js + Express) kurulumu.
  - Klasör yapısının düzenlenmesi (Client/Server ayrımı).
- [x] **Veritabanı ve ORM Kurulumu**
  - PostgreSQL veritabanının hazırlanması.
  - Prisma kurulumu ve `init` işlemi.
  - Temel veritabanı şemasının tasarlanması (`User`, `Role`, `Link` modelleri).
- [x] **Temel API Yapısı**
  - Express sunucusunun ayağa kaldırılması.
  - Hata yönetimi ve loglama altyapısı.

## 🔐 Faz 2: Kimlik Doğrulama ve Admin Paneli (Çekirdek)
Yöneticilerin sisteme giriş yapabilmesi ve yetki seviyelerinin ayarlanması.

- [x] **Auth Sistemi**
  - JWT (JSON Web Token) tabanlı kayıt ve giriş sistemi.
  - Şifreleme (bcrypt).
- [x] **Rol Yönetimi (RBAC)**
  - Roller: Başkan (Süper Admin), Medya Sorumlusu (Editör).
  - Middleware ile yetki kontrolleri.
- [x] **Admin Dashboard Arayüzü**
  - Vue ile admin paneli iskeleti (Sidebar, Header).
  - Giriş sayfası tasarımı.

## 🔗 Faz 3: Link Yönetimi ve Ön Yüz (Linktree Modülü)
Kullanıcıların göreceği ana sayfa ve linklerin yönetimi.

- [x] **Link Yönetimi (Backend & Frontend)**
  - Link Ekleme, Düzenleme, Silme, Sıralama (Drag & Drop).
  - Link aktif/pasif durumu.
- [x] **Public Arayüz (Landing Page)**
  - Linktree benzeri mobil uyumlu tasarım.
  - **Özel Temalar:**
    - Lacivert + Altın (Kurumsal)
    - Beyaz + Yeşil (Finans)
    - Minimal Gri + Mavi (Akademik)
  - Animasyonlu geçişler ve buton efektleri.

## 📱 Faz 4: Gelişmiş QR Kod Sistemi
Etkinlikler ve linkler için özelleştirilebilir QR kod altyapısı.

- [x] **QR Kod Motoru**
  - Dinamik QR oluşturma (URL değişse de QR aynı kalır).
  - QR içine logo gömme özelliği.
  - Renk ve tasarım özelleştirme.
- [x] **Etkinlik Bazlı QR**
  - Tek tıkla etkinlik için özel QR üretimi.
  - İndirilebilir formatlar (PNG, SVG).

## 📊 Faz 5: Analitik ve Raporlama
Veriye dayalı yönetim için takip sistemi.

- [x] **Takip Sistemi (Tracking)**
  - Her link ve QR için tıklanma sayacı.
  - Cihaz, Tarayıcı ve Lokasyon (Şehir bazlı) takibi.
- [x] **Görselleştirme**
  - Admin panelinde Chart.js veya ApexCharts ile grafikler.
  - Günlük/Haftalık/Aylık rapor ekranları.

## 📅 Faz 6: Etkinlik ve Form Yönetimi
Topluluk organizasyonunu dijitalleştiren modüller.

- [x] **Etkinlik Modülü**
  - Etkinlik oluşturma (Kapak, Tarih, Konum).
  - Geçmiş etkinlikler arşivi.
- [x] **Form Sistemi**
  - Üyelik ve Gönüllü başvuru formları.
  - Başvuruların admin panelinde listelenmesi.
  - Excel (CSV/XLSX) olarak dışa aktarma.

## 🤝 Faz 7: Sosyal Medya, Blog ve Sponsorlar
İçerik zenginleştirme ve dış bağlantılar.

- [x] **İçerik Yönetimi**
  - Mini Blog / Duyuru alanı.
  - Sponsor logoları ve yönetimi.
- [x] **Sosyal Medya Entegrasyonu**
  - Instagram feed embed.
  - [x] YouTube video galeri.

## 🎁 Faz 8: Bonus Özellikler (Level Up)
Topluluğu öne çıkaracak ekstra araçlar.

- [x] **Ekonomi Araçları**
  - Enflasyon, Faiz hesaplayıcıları.
  - Döviz kuru widget'ı.
- [x] **Dijital Kimlik (Topluluk Kartı)**
  - Üyeye özel QR kimlik kartı sayfası.
  - Admin tarafında QR okutarak yoklama alma.
- [x] **Sertifika Sistemi**
  - Katılımcılara otomatik PDF sertifika üretimi.

## 🎨 Faz 9: UI/UX Polish ve Deploy
Son dokunuşlar ve yayına alma.

- [x] **Animasyonlar**
  - Sayfa geçişleri ve mikro etkileşimler.
- [x] **Performans ve SEO**
  - Görsel optimizasyonları.
  - Meta etiketleri.
- [x] **Deploy**
  - Sunucu kurulumu ve yayına alma.

---
**Proje Durumu:** 🎉 **TAMAMLANDI** 🎉
Tüm fazlar başarıyla tamamlanmıştır. Platform yayına hazırdır.

**Not:** Geliştirme sürecinde "Vibe Coding" yaklaşımı ile hızlı, iteratif ve görsel odaklı ilerlenecektir.
