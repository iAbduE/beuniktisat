<template>
  <div class="qr-page relative min-h-screen overflow-hidden text-white">

    <svg class="hidden" aria-hidden="true">
      <filter id="qr-glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
        <feTurbulence type="fractalNoise" baseFrequency="0.001 0.005" numOctaves="1" seed="17" result="turbulence" />
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
          <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
          <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
        </feComponentTransfer>
        <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
        <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100" lightingColor="white" result="specLight">
          <fePointLight x="-200" y="-200" z="300" />
        </feSpecularLighting>
        <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />
        <feDisplacementMap in="SourceGraphic" in2="softMap" scale="200" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>

    <main class="relative z-10 mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div v-if="loading" class="flex min-h-[80vh] items-center justify-center">
        <div class="text-center">
          <div class="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
          <p class="mt-4 text-white/70">QR sayfası hazırlanıyor...</p>
        </div>
      </div>

      <div v-else-if="error" class="flex min-h-[80vh] items-center justify-center">
        <div class="glass-panel max-w-md p-8 text-center">
          <p class="text-4xl">⚠️</p>
          <h1 class="mt-4 text-2xl font-bold">QR Sayfası Bulunamadı</h1>
          <p class="mt-2 text-white/65">{{ error }}</p>
        </div>
      </div>

      <div v-else-if="qrCode" class="space-y-6">
        <!-- Header -->
        <header class="glass-panel p-6 text-center sm:p-8">
          <div class="glass-content">
            <p class="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/80">BEÜ İktisat Topluluğu</p>
            <h1 class="text-3xl font-black tracking-tight sm:text-5xl">{{ event?.title || qrCode.name }}</h1>
            <p class="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
              {{ event ? 'Etkinlik bilgileri, kayıt adımları ve katılım avantajları' : 'Bilgi ve yönlendirme QR sayfası' }}
            </p>
          </div>
        </header>

        <section class="grid gap-6 lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
          <!-- QR card -->
          <article class="glass-panel qr-panel p-5 sm:p-8">
            <div class="glass-content flex h-full flex-col items-center justify-center text-center">
              <span class="rounded-full border border-cyan-200/25 bg-cyan-200/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">
                QR kodu okut
              </span>
              <h2 class="mt-4 text-2xl font-bold">Kayıt ve Bilgiye Ulaş</h2>
              <p class="mt-2 max-w-sm text-sm text-white/65">
                Telefon kameranızla QR kodu okutun. Açılan sayfadaki bilgileri dikkatlice doldurun.
              </p>

              <div v-if="qrDataUrl" class="qr-shell mt-6">
                <img :src="qrDataUrl" :alt="`${qrCode.name} QR kodu`" />
                <div class="qr-logo" aria-hidden="true">
                  <img v-if="qrLogo" :src="qrLogo" alt="" @error="logoBroken = true" />
                  <span v-else>BEÜ</span>
                </div>
              </div>

              <p class="mt-5 text-xs text-white/45">
                Güvenli yönlendirme ve tarama takibi etkinleştirilmiştir.
              </p>

              <a
                v-if="!event"
                :href="qrCode.targetUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-5 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/20"
              >
                Hedefi Aç ↗
              </a>
            </div>
          </article>

          <!-- Event details -->
          <div class="space-y-6">
            <article v-if="event" class="glass-panel p-6 sm:p-8">
              <div class="glass-content">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <h2 class="text-2xl font-bold">Etkinlik Bilgileri</h2>
                  <span
                    :class="event.formEnabled ? 'bg-emerald-300/15 text-emerald-100' : 'bg-amber-300/15 text-amber-100'"
                    class="rounded-full px-3 py-1 text-xs font-bold"
                  >
                    {{ event.formEnabled ? 'Kayıt açık' : 'Kayıt kapalı' }}
                  </span>
                </div>
                <p v-if="event.description" class="mt-3 leading-7 text-white/70">{{ event.description }}</p>
                <div class="mt-5 grid gap-3 text-sm text-white/75 sm:grid-cols-2">
                  <div class="info-chip">📅 <span>{{ formatDate(event.date) }}</span></div>
                  <div v-if="event.location" class="info-chip">📍 <span>{{ event.location }}</span></div>
                </div>
              </div>
            </article>

            <article class="glass-panel p-6 sm:p-8">
              <div class="glass-content">
                <h2 class="text-2xl font-bold">Form Nasıl Doldurulur?</h2>
                <ol class="mt-5 space-y-4">
                  <li v-for="(step, index) in formSteps" :key="step" class="flex gap-3">
                    <span class="step-number">{{ index + 1 }}</span>
                    <span class="pt-1 text-sm leading-6 text-white/75">{{ step }}</span>
                  </li>
                </ol>
                <div class="mt-6 rounded-2xl border border-cyan-200/20 bg-cyan-200/10 p-4 text-sm leading-6 text-cyan-50">
                  <strong>Önemli:</strong> Ön kayıt formu bilgi toplamak içindir. Katılım ve sertifika hakkınızın oluşması için etkinlik sırasında projeksiyonda gösterilen <strong>hareketli QR</strong> kodu ayrıca okutmalısınız.
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- Benefits -->
        <section class="glass-panel p-6 sm:p-8">
          <div class="glass-content">
            <div class="text-center">
              <p class="text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-200/80">Toplulukla Birlikte</p>
              <h2 class="mt-2 text-2xl font-black sm:text-3xl">Katılımın Sana Katkıları</h2>
              <p class="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/65">
                Etkinliklere düzenli katılım, yalnızca bir sertifika değil; görünür, doğrulanabilir ve kariyerine taşıyabileceğin bir gelişim izi oluşturur.
              </p>
            </div>

            <div class="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div v-for="benefit in benefits" :key="benefit.title" class="benefit-card">
                <div class="benefit-mark">QR</div>
                <div>
                  <h3 class="font-bold text-white">{{ benefit.title }}</h3>
                  <p class="mt-1 text-xs leading-5 text-white/60">{{ benefit.description }}</p>
                </div>
              </div>
            </div>

            <p class="mt-7 text-center text-[11px] leading-5 text-white/45">
              Sertifika, yalnızca etkinlikteki hareketli QR ile doğrulanmış katılım sonrasında oluşturulur. Bilgilerinizi doğru ve güncel girmeniz, sertifikanızın ve öğrenci kaydınızın doğru eşleşmesi için önemlidir.
            </p>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import QRCode from 'qrcode';
import API_BASE_URL, { API_URL, imageUrl } from '../config/api';

interface QrCodeData {
  name: string;
  targetUrl: string;
  shortCode: string;
  logoUrl?: string | null;
  isActive: boolean;
}

interface EventData {
  title: string;
  description?: string | null;
  date: string;
  location?: string | null;
  imageUrl?: string | null;
  formEnabled: boolean;
}

const route = useRoute();
const shortCode = route.params.shortCode as string;

const loading = ref(true);
const error = ref('');
const qrCode = ref<QrCodeData | null>(null);
const event = ref<EventData | null>(null);
const qrDataUrl = ref('');
const siteLogo = ref('');
const logoBroken = ref(false);

const formSteps = [
  'QR kodu telefon kameranızla okutun ve açılan kayıt sayfasını bekleyin.',
  'Ad soyad, e-posta, okul numarası ve bölüm bilgilerinizi doğru şekilde girin.',
  'Formu göndererek etkinlik için ön kaydınızı oluşturun.',
  'Etkinlik sırasında projeksiyondaki hareketli QR kodu da okutun; katılımınız ve sertifikanız otomatik kaydedilsin.',
];

const benefits = [
  {
    title: 'OBS Sosyal Transkript',
    description: 'Katılım ve gelişim izlerinizi sosyal transkript sürecinde kullanabileceğiniz doğrulanabilir belgelerle destekleyin.',
  },
  {
    title: 'CV ve LinkedIn görünürlüğü',
    description: 'Seminer, atölye ve proje katılımlarınızı somut sertifikalarla CV’nize ve LinkedIn profilinize taşıyın.',
  },
  {
    title: 'Topluluk ağı',
    description: 'Farklı sınıf, bölüm ve ilgi alanlarından öğrencilerle tanışıp güçlü bir çevre oluşturun.',
  },
  {
    title: 'İş ve staj avantajı',
    description: 'Sektör buluşmaları ve işveren temasları sayesinde staj, mentorluk ve iş fırsatlarına daha erken ulaşın.',
  },
  {
    title: 'Yetkinlik gelişimi',
    description: 'Ekonomi, finans, veri, sunum, iletişim ve ekip çalışması becerilerinizi uygulamalı etkinliklerle geliştirin.',
  },
  {
    title: 'Aktif üyelik kültürü',
    description: 'Görev alarak liderlik, sorumluluk, organizasyon ve proje yönetimi deneyimi kazanın.',
  },
];

const qrLogo = computed(() => {
  if (logoBroken.value) return '';
  if (qrCode.value?.logoUrl) return imageUrl(qrCode.value.logoUrl);
  return siteLogo.value;
});

const formatDate = (date: string) => new Date(date).toLocaleDateString('tr-TR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const loadSettings = async () => {
  try {
    const response = await fetch(`${API_URL}/settings`);
    const data = await response.json();
    if (data?.profileImage) {
      siteLogo.value = imageUrl(data.profileImage) || `${API_BASE_URL}${data.profileImage}`;
    }
  } catch (e) {
    // Site logosu opsiyoneldir.
  }
};

const createQrImage = async () => {
  if (!qrCode.value) return;
  const scanUrl = `${API_BASE_URL}/api/qr-track/scan/${encodeURIComponent(qrCode.value.shortCode)}`;
  qrDataUrl.value = await QRCode.toDataURL(scanUrl, {
    margin: 4,
    width: 520,
    errorCorrectionLevel: 'H',
    color: { dark: '#111827', light: '#ffffff' },
  });
};

const loadPage = async () => {
  try {
    const response = await fetch(`${API_URL}/qr-track/public/${encodeURIComponent(shortCode)}`);
    const data = await response.json();
    if (!response.ok) {
      error.value = data.error || 'QR kod bulunamadı.';
      return;
    }

    qrCode.value = data.qrCode;
    event.value = data.event;
    await createQrImage();
  } catch (e) {
    error.value = 'Bağlantı hatası. Lütfen tekrar deneyin.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadPage();
  loadSettings();
});
</script>

<style scoped>
.qr-page {
  background-image: url("https://images.unsplash.com/photo-1432251407527-504a6b4174a2?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D");
  background-position: center center;
  background-size: cover;
  animation: moveBackground 60s linear infinite;
}

.qr-page::before {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(5, 8, 30, 0.58), rgba(38, 20, 66, 0.34));
  content: '';
  pointer-events: none;
}

.glass-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 1.75rem;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 18px 55px rgba(0, 0, 0, 0.2), 0 0 25px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(12px);
}

.glass-panel::before {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: rgba(255, 255, 255, 0.08);
  content: '';
  filter: url(#qr-glass-distortion);
  opacity: 0.7;
  pointer-events: none;
}

.glass-panel::after {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
  box-shadow: inset 2px 2px 1px rgba(255, 255, 255, 0.35), inset -1px -1px 1px rgba(255, 255, 255, 0.22);
  content: '';
  pointer-events: none;
}

.glass-content {
  position: relative;
  z-index: 2;
}

.qr-panel {
  min-height: 34rem;
}

.qr-shell {
  position: relative;
  width: min(72vw, 25rem);
  aspect-ratio: 1;
  padding: 1rem;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
}

.qr-shell > img {
  display: block;
  width: 100%;
  height: 100%;
}

.qr-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22%;
  aspect-ratio: 1;
  padding: 1.5%;
  border: 3px solid white;
  border-radius: 24%;
  background: white;
  color: #1e3a5f;
  font-size: 1rem;
  font-weight: 900;
  box-shadow: 0 3px 12px rgba(15, 23, 42, 0.3);
  transform: translate(-50%, -50%);
  overflow: hidden;
}

.qr-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 18%;
}

.info-chip {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.9rem;
  background: rgba(0, 0, 0, 0.12);
  padding: 0.75rem;
}

.step-number {
  display: flex;
  width: 1.75rem;
  height: 1.75rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: linear-gradient(135deg, #67e8f9, #a78bfa);
  color: #111827;
  font-size: 0.8rem;
  font-weight: 900;
}

.benefit-card {
  display: flex;
  gap: 0.85rem;
  min-height: 7rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.07);
  padding: 1rem;
  transition: transform 0.3s ease, background 0.3s ease;
}

.benefit-card:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.12);
}

.benefit-mark {
  display: flex;
  width: 2.25rem;
  height: 2.25rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.7);
  border-radius: 0.6rem;
  background: repeating-linear-gradient(45deg, #fff 0 3px, #243b85 3px 6px);
  color: #111827;
  font-size: 0.55rem;
  font-weight: 900;
  letter-spacing: -0.08em;
  text-shadow: 0 0 2px white;
}

@media (max-width: 640px) {
  .qr-panel {
    min-height: 0;
  }
}

@keyframes moveBackground {
  from {
    background-position: 0% 0%;
  }
  to {
    background-position: 0% -1000%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .qr-page {
    animation: none;
  }
}
</style>
