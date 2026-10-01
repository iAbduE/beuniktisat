<template>
  <div class="relative min-h-screen">
    <div class="fixed inset-0">
      <AnimatedBackground />
    </div>

    <div class="relative z-10 flex flex-col items-center py-10 px-4 min-h-screen">
      <!-- Başlık -->
      <div class="text-center mb-8 animate-fade-in">
        <div class="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 text-3xl shadow-xl">
          🎓
        </div>
        <h1 class="text-2xl font-extrabold text-white tracking-wide drop-shadow">Öğrenci Portalı</h1>
        <p class="text-white/70 mt-2 text-sm">Dijital kartını ve sertifikalarını görüntüle</p>
      </div>

      <!-- Sorgu Formu -->
      <div v-if="!result" class="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-6 animate-slide-up">
        <form @submit.prevent="lookup" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Öğrenci Numarası</label>
            <input
              v-model="studentId"
              type="text"
              inputmode="numeric"
              placeholder="Örn. 20210101"
              required
              class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">E-posta Adresi</label>
            <input
              v-model="email"
              type="email"
              placeholder="ornek@ogrenci.beun.edu.tr"
              required
              class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <p v-if="error" class="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl p-3">
            {{ error }}
          </p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all hover:shadow-xl disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
            {{ loading ? 'Sorgulanıyor...' : 'Belgelerimi Getir' }}
          </button>
        </form>
        <p class="text-xs text-gray-400 text-center mt-4">
          Güvenliğiniz için öğrenci numarası ve e-postanızın <b>ikisi birden</b> eşleşmelidir.
        </p>
      </div>

      <!-- Sonuç -->
      <div v-else class="w-full max-w-md space-y-5 animate-slide-up">
        <!-- Üye kartı özeti -->
        <div class="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-6 text-center">
          <div class="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl font-bold text-blue-600">
            {{ getInitials(result.name) }}
          </div>
          <h2 class="text-xl font-bold text-gray-800">{{ result.name }}</h2>
          <p class="text-blue-600 text-sm font-medium">{{ result.department || '—' }}</p>
          <div class="mt-2">
            <span
              :class="result.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
              class="text-xs font-bold px-3 py-1 rounded-full"
            >
              {{ result.isActive ? 'AKTİF ÜYE' : 'PASİF ÜYE' }}
            </span>
          </div>
          <router-link
            :to="`/card/${result.qrCode}`"
            class="mt-5 inline-flex items-center justify-center gap-2 w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            📇 Dijital Kartımı Aç
          </router-link>
        </div>

        <!-- Sertifikalar -->
        <div class="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-800">Sertifikalarım</h3>
            <span class="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
              {{ result.certificates.length }}
            </span>
          </div>

          <div v-if="result.certificates.length === 0" class="text-center text-gray-400 text-sm py-6">
            Henüz sertifikanız bulunmuyor.<br />
            Etkinliklere katıldıkça burada listelenecek.
          </div>

          <ul v-else class="space-y-3">
            <li
              v-for="cert in result.certificates"
              :key="cert.uniqueId"
              class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
            >
              <span class="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-50 flex items-center justify-center text-lg">🏅</span>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-800 text-sm truncate">{{ cert.eventTitle }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(cert.eventDate) }}</p>
              </div>
              <a
                :href="certificateUrl(cert.uniqueId)"
                target="_blank"
                class="shrink-0 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
              >
                İndir
              </a>
            </li>
          </ul>
        </div>

        <button
          @click="reset"
          class="w-full text-white/80 hover:text-white text-sm font-medium py-2 transition-colors"
        >
          ← Başka bir sorgu yap
        </button>
      </div>

      <router-link to="/" class="mt-8 text-white/60 hover:text-white text-sm transition-colors">
        ← Ana Sayfaya Dön
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { API_URL } from '../config/api';
import AnimatedBackground from '../components/AnimatedBackground.vue';

interface Certificate {
  uniqueId: string;
  eventTitle: string;
  eventDate: string;
}
interface LookupResult {
  name: string;
  department: string | null;
  studentId: string | null;
  qrCode: string;
  isActive: boolean;
  certificates: Certificate[];
}

const studentId = ref('');
const email = ref('');
const loading = ref(false);
const error = ref('');
const result = ref<LookupResult | null>(null);

const lookup = async () => {
  error.value = '';
  loading.value = true;
  try {
    const response = await fetch(`${API_URL}/members/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: studentId.value, email: email.value }),
    });
    const data = await response.json();
    if (response.ok) {
      result.value = data;
    } else {
      error.value = data.error || 'Sorgulama başarısız oldu.';
    }
  } catch (e) {
    error.value = 'Bağlantı hatası. Lütfen tekrar deneyin.';
  } finally {
    loading.value = false;
  }
};

const reset = () => {
  result.value = null;
  error.value = '';
};

const certificateUrl = (uniqueId: string) => `${API_URL}/certificates/public/${uniqueId}`;

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}
.animate-slide-up {
  animation: slideUp 0.5s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
