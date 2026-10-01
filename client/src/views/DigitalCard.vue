<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-4">
    <div v-if="member" class="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm relative">
      <!-- Header Background -->
      <div class="h-32 bg-blue-600 relative">
        <div class="absolute inset-0 bg-pattern opacity-20"></div>
      </div>

      <!-- Profile Image / Initials -->
      <div class="absolute top-16 left-1/2 transform -translate-x-1/2">
        <div class="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
          <div class="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-4xl font-bold text-blue-600">
            {{ getInitials(member.name) }}
          </div>
        </div>
      </div>

      <!-- Card Content -->
      <div class="pt-20 pb-8 px-6 text-center">
        <h1 class="text-2xl font-bold text-gray-800 mb-1">{{ member.name }}</h1>
        <p class="text-blue-600 font-medium mb-4">{{ member.department }}</p>
        
        <div class="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
          <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Öğrenci Numarası</p>
          <p class="text-lg font-mono font-bold text-gray-700">{{ member.studentId || '---' }}</p>
        </div>

        <!-- QR Code -->
        <div class="flex justify-center mb-6">
          <div class="bg-white p-2 rounded-lg shadow-inner border">
            <img 
              :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${member.qrCode}`" 
              alt="Member QR" 
              class="w-32 h-32"
            />
          </div>
        </div>
        <p class="text-xs text-gray-400">Bu QR kodu etkinlik girişlerinde okutunuz.</p>

        <!-- Status Badge -->
        <div class="mt-6">
          <span 
            v-if="member.isActive" 
            class="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full"
          >
            AKTİF ÜYE
          </span>
          <span 
            v-else 
            class="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full"
          >
            PASİF ÜYE
          </span>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-50 p-4 text-center border-t border-gray-100">
        <p class="text-xs text-gray-500">BEÜ İktisat Topluluğu Dijital Kimlik Kartı</p>
      </div>
    </div>

    <div v-else-if="loading" class="text-white text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
      <p>Kart bilgileri yükleniyor...</p>
    </div>

    <div v-else class="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
      <div class="text-red-500 text-5xl mb-4">⚠️</div>
      <h2 class="text-xl font-bold text-gray-800 mb-2">Üye Bulunamadı</h2>
      <p class="text-gray-600">Aradığınız dijital kart mevcut değil veya silinmiş olabilir.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { API_URL } from '../config/api';

const route = useRoute();
const member = ref<any>(null);
const loading = ref(true);

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const fetchMember = async () => {
  const qrCode = route.params.qrCode;
  if (!qrCode) {
    loading.value = false;
    return;
  }

  try {
    const response = await fetch(`${API_URL}/members/card/${qrCode}`);
    if (response.ok) {
      member.value = await response.json();
    }
  } catch (error) {
    console.error('Kart bilgisi alınamadı:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchMember);
</script>

<style scoped>
.bg-pattern {
  background-image: radial-gradient(circle, #ffffff 2px, transparent 2.5px);
  background-size: 10px 10px;
}
</style>
