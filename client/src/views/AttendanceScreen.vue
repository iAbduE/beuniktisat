<template>
  <div class="relative min-h-screen overflow-hidden bg-[#0B1026] text-white select-none">
    <SilkShader />

    <div class="relative z-10 flex min-h-screen flex-col items-center justify-center p-6">
      <!-- Başlık -->
      <div class="mb-8 text-center">
        <p class="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/55">BEÜ İktisat Topluluğu</p>
        <h1 class="text-3xl font-extrabold tracking-wide md:text-4xl">Katılım QR'ı</h1>
        <p class="mt-2 text-xl text-white/75">{{ eventTitle || 'Etkinlik' }}</p>
      </div>

      <!-- Hata -->
      <div v-if="error" class="text-center">
        <p class="mb-2 text-3xl font-bold text-red-300">⚠️ {{ error }}</p>
        <p class="text-white/60">Etkinlik kayıt formunun açık olduğundan emin olun.</p>
        <button
          @click="loadTicket"
          class="mt-6 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-gray-950 hover:bg-cyan-300"
        >
          🔄 Yeniden Dene
        </button>
      </div>

      <!-- QR -->
      <div v-else-if="qrDataUrl" class="qr-card">
        <div class="qr-frame">
          <img :src="qrDataUrl" alt="Katılım QR" />
          <div class="qr-logo" aria-hidden="true">
            <img v-if="siteLogo" :src="siteLogo" alt="" @error="siteLogo = ''" />
            <span v-else>BEÜ</span>
          </div>
        </div>
      </div>
      <div v-else class="text-center">
        <div class="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
        <p class="mt-4 text-white/60">QR hazırlanıyor...</p>
      </div>

      <!-- Geri sayım -->
      <div v-if="qrDataUrl" class="mt-8 text-center">
        <div class="flex items-center justify-center gap-5">
          <div class="flex h-24 w-24 items-center justify-center rounded-full border-4 border-cyan-300/90 bg-black/10 backdrop-blur-sm">
            <span class="text-5xl font-bold tabular-nums">{{ seconds }}</span>
          </div>
          <div class="text-left text-white/70">
            <p class="text-lg font-semibold text-white">QR kod yenileniyor</p>
            <p class="max-w-xs text-sm">
              Bu QR her {{ REFRESH_INTERVAL }} saniyede bir değişir. Ekran görüntüsü alınıp
              paylaşılsa bile en geç 60 saniye içinde geçersiz olur.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import QRCode from 'qrcode';
import SilkShader from '../components/SilkShader.vue';
import API_BASE_URL, { API_URL, imageUrl } from '../config/api';

const REFRESH_INTERVAL = 30;

const route = useRoute();
const projectionCode = route.params.projectionCode as string;

const eventTitle = ref('');
const qrDataUrl = ref('');
const siteLogo = ref('');
const error = ref('');
const seconds = ref(REFRESH_INTERVAL);

let timer: number | null = null;
let countdownTimer: number | null = null;

const getToken = () => localStorage.getItem('token');

const loadSettings = async () => {
  try {
    const res = await fetch(`${API_URL}/settings`);
    const data = await res.json();
    if (data?.profileImage) {
      siteLogo.value = imageUrl(data.profileImage) || `${API_BASE_URL}${data.profileImage}`;
    }
  } catch (e) {
    // Logo optional; QR ekranı logosuz da çalışır.
  }
};

const loadTicket = async () => {
  try {
    const res = await fetch(`${API_URL}/registrations/ticket/${encodeURIComponent(projectionCode)}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();

    if (!res.ok) {
      error.value = data.error || 'Ticket alınamadı.';
      qrDataUrl.value = '';
      return;
    }

    error.value = '';
    eventTitle.value = data.eventTitle;
    const qrContent = `${window.location.origin}/register/${data.formCode}?ticket=${data.ticket}`;
    qrDataUrl.value = await QRCode.toDataURL(qrContent, {
      margin: 4,
      width: 400,
      errorCorrectionLevel: 'H',
      color: { dark: '#000000', light: '#ffffff' },
    });
    seconds.value = REFRESH_INTERVAL;
  } catch (e) {
    error.value = 'Bağlantı hatası.';
    qrDataUrl.value = '';
  }
};

const startCountdown = () => {
  countdownTimer = window.setInterval(() => {
    seconds.value = Math.max(0, seconds.value - 1);
    if (seconds.value === 0) seconds.value = REFRESH_INTERVAL;
  }, 1000);
};

onMounted(() => {
  loadTicket();
  loadSettings();
  timer = window.setInterval(loadTicket, REFRESH_INTERVAL * 1000);
  startCountdown();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  if (countdownTimer) clearInterval(countdownTimer);
});
</script>

<style scoped>
.qr-card {
  padding: clamp(1rem, 2vw, 2rem);
  border-radius: 1.75rem;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 24px 80px rgba(5, 8, 35, 0.45);
}

.qr-frame {
  position: relative;
  width: min(72vw, 28rem);
  aspect-ratio: 1;
}

.qr-frame > img {
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
  border: 3px solid #fff;
  border-radius: 24%;
  background: #fff;
  box-shadow: 0 3px 12px rgba(15, 23, 42, 0.28);
  color: #1e3a5f;
  font-size: clamp(0.65rem, 2vw, 1.25rem);
  font-weight: 800;
  transform: translate(-50%, -50%);
  overflow: hidden;
}

.qr-logo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 18%;
}
</style>
