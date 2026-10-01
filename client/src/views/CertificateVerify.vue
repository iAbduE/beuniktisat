<template>
  <div class="relative min-h-screen">
    <div class="fixed inset-0">
      <AnimatedBackground />
    </div>

    <div class="relative z-10 flex flex-col items-center justify-center py-10 px-4 min-h-screen">
      <!-- Yükleniyor -->
      <div v-if="loading" class="text-white text-center">
        <div class="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p>Sertifika doğrulanıyor...</p>
      </div>

      <!-- Geçerli -->
      <div
        v-else-if="cert && cert.valid"
        class="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 overflow-hidden animate-slide-up"
      >
        <div class="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center text-white">
          <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center text-3xl">
            ✓
          </div>
          <h1 class="text-xl font-bold">Sertifika Doğrulandı</h1>
          <p class="text-white/80 text-sm mt-1">Bu belge gerçek ve geçerlidir.</p>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Katılımcı</p>
            <p class="text-lg font-bold text-gray-800">{{ cert.memberName }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Etkinlik</p>
            <p class="font-semibold text-gray-800">{{ cert.eventTitle }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Etkinlik Tarihi</p>
              <p class="text-sm font-medium text-gray-700">{{ formatDate(cert.eventDate) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Düzenleyen</p>
              <p class="text-sm font-medium text-gray-700">BEÜ İktisat Topluluğu</p>
            </div>
          </div>
          <div class="pt-3 border-t border-gray-100">
            <p class="text-[10px] text-gray-400 break-all">Doğrulama Kodu: {{ cert.uniqueId }}</p>
          </div>

          <a
            :href="downloadUrl"
            target="_blank"
            class="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            📄 Sertifikayı İndir (PDF)
          </a>
        </div>
      </div>

      <!-- Geçersiz -->
      <div
        v-else
        class="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 text-center animate-slide-up"
      >
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center text-3xl">
          ✕
        </div>
        <h1 class="text-xl font-bold text-gray-800 mb-2">Sertifika Bulunamadı</h1>
        <p class="text-gray-500 text-sm">
          Bu doğrulama koduna ait geçerli bir sertifika bulunamadı. Kodun doğru olduğundan emin olun.
        </p>
      </div>

      <router-link to="/" class="mt-8 text-white/60 hover:text-white text-sm transition-colors">
        ← Ana Sayfaya Dön
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { API_URL } from '../config/api';
import AnimatedBackground from '../components/AnimatedBackground.vue';

interface VerifyResult {
  valid: boolean;
  memberName?: string;
  eventTitle?: string;
  eventDate?: string;
  issueDate?: string;
  uniqueId?: string;
}

const route = useRoute();
const cert = ref<VerifyResult | null>(null);
const loading = ref(true);

const code = computed(() => route.params.code as string);
const downloadUrl = computed(() => `${API_URL}/certificates/public/${code.value}`);

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

onMounted(async () => {
  try {
    const response = await fetch(`${API_URL}/certificates/verify/${code.value}`);
    cert.value = await response.json();
  } catch (e) {
    cert.value = { valid: false };
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.5s ease-out forwards;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
