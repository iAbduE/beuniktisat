<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center text-white">
        <div class="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-4xl">📋</span>
        </div>
        <h1 class="text-2xl font-bold">Etkinlik Kayıt Formu</h1>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="mt-4 text-gray-600">Yükleniyor...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="p-8 text-center">
        <span class="text-6xl block mb-4">❌</span>
        <p class="text-red-600 font-semibold">{{ error }}</p>
        <router-link to="/" class="mt-4 inline-block text-blue-600 hover:underline">
          Ana Sayfaya Dön
        </router-link>
      </div>

      <!-- Success -->
      <div v-else-if="submitted" class="p-8 text-center">
        <span class="text-6xl block mb-4">🎉</span>
        <h2 class="text-2xl font-bold text-green-600 mb-2">Kayıt Başarılı!</h2>
        <p v-if="certificateIssued" class="text-gray-600 mb-4">Katılımınız onaylandı ve sertifikanız kaydedildi.</p>
        <p v-else class="text-gray-600 mb-4">Ön kaydınız alındı. Sertifika için etkinlik sırasında hareketli QR kodu okutmalısınız.</p>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
          <p><strong>{{ event?.title }}</strong> etkinliğine başarıyla kayıt oldunuz!</p>
          <p v-if="certificateIssued" class="mt-1">Sertifikanızı <router-link to="/belgelerim" class="underline font-semibold">Öğrenci Portalı</router-link>'ndan görüntüleyebilirsiniz.</p>
        </div>
        <router-link to="/" class="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Ana Sayfaya Dön
        </router-link>
      </div>

      <!-- Form -->
      <div v-else-if="event" class="p-6">
        <!-- Event Info -->
          <div class="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
            <h2 class="font-bold text-blue-800 text-lg">{{ event.title }}</h2>
            <p v-if="event.description" class="text-sm text-blue-600 mt-1">{{ event.description }}</p>
          <div class="flex items-center gap-4 mt-2 text-sm text-blue-700">
            <span>📅 {{ formatDate(event.date) }}</span>
              <span v-if="event.location">📍 {{ event.location }}</span>
            </div>
          </div>
          <div
            :class="ticket ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'"
            class="rounded-lg border p-3 mb-6 text-sm"
          >
            <span v-if="ticket">✓ Hareketli QR doğrulandı. Bu kayıt katılım ve sertifika hakkı oluşturur.</span>
            <span v-else>ℹ️ Bu form ön kayıt içindir. Katılım ve sertifika için etkinlik sırasında yansıtılan hareketli QR kodu okutun.</span>
          </div>

        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
            <input 
              v-model="form.name" 
              type="text" 
              required
              class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Adınız Soyadınız"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
            <input 
              v-model="form.email" 
              type="email" 
              required
              class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="ornek@email.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Okul Numarası</label>
            <input 
              v-model="form.studentId" 
              type="text" 
              class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="123456789"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input 
              v-model="form.phone" 
              type="tel" 
              class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="05XX XXX XX XX"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Bölüm</label>
            <input 
              v-model="form.department" 
              type="text" 
              class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="İktisat, İşletme..."
            />
          </div>

          <p v-if="formError" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {{ formError }}
          </p>

          <button 
            type="submit"
            :disabled="submitting"
            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {{ submitting ? 'Kaydediliyor...' : '✓ Kayıt Ol' }}
          </button>

          <p class="text-xs text-center text-gray-500">
            Ön kayıt, etkinlikteki hareketli QR katılımı ve sertifika işlemleri ayrı tutulur. 🎓
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { API_URL } from '../config/api';

interface Event {
  id: number;
  title: string;
  description?: string;
  date: string;
  location?: string;
  imageUrl?: string;
}

const route = useRoute();
const formCode = route.params.formCode as string;
const ticket = (route.query.ticket as string) || '';

const loading = ref(true);
const error = ref('');
const event = ref<Event | null>(null);
const submitted = ref(false);
const certificateIssued = ref(false);
const submitting = ref(false);
const formError = ref('');

const form = ref({
  name: '',
  email: '',
  studentId: '',
  phone: '',
  department: ''
});

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const fetchEvent = async () => {
  try {
    const query = ticket ? `?ticket=${encodeURIComponent(ticket)}` : '';
    const response = await fetch(`${API_URL}/registrations/form/${formCode}${query}`);
    const data = await response.json();
    
    if (!response.ok) {
      error.value = data.error || 'Etkinlik bulunamadı.';
      return;
    }
    
    event.value = data;
  } catch (err) {
    error.value = 'Bağlantı hatası.';
  } finally {
    loading.value = false;
  }
};

const submitForm = async () => {
  if (!form.value.name || !form.value.email) {
    formError.value = 'Ad ve e-posta zorunludur.';
    return;
  }

  submitting.value = true;
  formError.value = '';

  try {
    const response = await fetch(`${API_URL}/registrations/form/${formCode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form.value, ticket })
    });

    const data = await response.json();

    if (!response.ok) {
      formError.value = data.error || 'Kayıt yapılamadı.';
      return;
    }

    certificateIssued.value = Boolean(data.certificateIssued);
    submitted.value = true;
  } catch (err) {
    formError.value = 'Bağlantı hatası.';
  } finally {
    submitting.value = false;
  }
};

onMounted(fetchEvent);
</script>
