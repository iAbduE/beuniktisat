<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-2xl font-bold text-gray-800">QR Kod Takip Sistemi</h3>
      <button 
        @click="showCreateModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
      >
        + Yeni QR Kod
      </button>
    </div>

    <!-- QR Code List -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="qr in qrCodes" 
        :key="qr.id"
        class="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div class="p-4">
          <div class="flex items-start justify-between mb-2">
            <h4 class="font-bold text-lg">{{ qr.name }}</h4>
            <span 
              v-if="isEventQr(qr.targetUrl)"
              class="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium"
            >
              📅 Etkinlik
            </span>
          </div>
          <p class="text-gray-500 text-sm truncate mb-3">{{ qr.targetUrl }}</p>
          
          <div class="flex items-center justify-between mb-4">
            <div class="text-center">
              <p class="text-3xl font-bold text-blue-600">{{ qr.scanCount }}</p>
              <p class="text-xs text-gray-500">Tarama</p>
            </div>
            <div 
              :class="qr.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              class="px-3 py-1 rounded-full text-xs font-semibold"
            >
              {{ qr.isActive ? 'Aktif' : 'Pasif' }}
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <button 
              @click="showQrImage(qr.shortCode)"
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded-lg text-sm"
              >
                📱 QR Göster
            </button>
            <button
              @click="openQrPage(qr.shortCode)"
              class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm font-semibold"
            >
              ✨ QR Sayfası
            </button>
            <button 
              @click="viewStats(qr.id)"
              class="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-3 rounded-lg text-sm"
            >
              📊 İstatistik
            </button>
            <button 
              @click="deleteQr(qr.id)"
              class="bg-red-100 hover:bg-red-200 text-red-800 py-2 px-3 rounded-lg text-sm"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Empty State -->
    <div v-if="qrCodes.length === 0" class="text-center py-12 bg-white rounded-xl shadow">
      <p class="text-gray-500 text-lg">Henüz QR kod oluşturulmamış.</p>
      <p class="text-gray-400 text-sm mt-2">Yeni bir QR kod oluşturmak için yukarıdaki butonu kullanın.</p>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h4 class="text-xl font-bold mb-4">Yeni QR Kod Oluştur</h4>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">QR Kod Adı</label>
            <input 
              v-model="newQr.name" 
              type="text" 
              placeholder="Örn: Seminer Kayıt QR"
              class="w-full border rounded-lg p-2"
            />
          </div>

          <!-- Hedef Tipi Seçimi -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Hedef Tipi</label>
            <div class="flex gap-2">
              <button 
                @click="targetType = 'url'"
                :class="targetType === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'"
                class="flex-1 py-2 px-3 rounded-lg font-medium transition-colors"
              >
                🔗 URL
              </button>
              <button 
                @click="targetType = 'event'"
                :class="targetType === 'event' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'"
                class="flex-1 py-2 px-3 rounded-lg font-medium transition-colors"
              >
                📅 Etkinlik Formu
              </button>
            </div>
          </div>

          <!-- URL Girişi -->
          <div v-if="targetType === 'url'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Hedef URL</label>
            <input 
              v-model="newQr.targetUrl" 
              type="url" 
              placeholder="https://..."
              class="w-full border rounded-lg p-2"
            />
          </div>

          <!-- Etkinlik Seçimi -->
          <div v-if="targetType === 'event'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Etkinlik Seçin</label>
            <select 
              v-model="selectedEventId"
              @change="onEventSelect"
              class="w-full border rounded-lg p-2"
            >
              <option :value="null">Bir etkinlik seçin...</option>
              <option 
                v-for="event in events" 
                :key="event.id" 
                :value="event.id"
              >
                {{ event.title }} ({{ formatDate(event.date) }})
              </option>
            </select>
            <p v-if="selectedEventId && !selectedEvent?.formEnabled" class="text-orange-600 text-sm mt-2">
              ⚠️ Bu etkinliğin kayıt formu kapalı. QR oluşturulduğunda otomatik açılacak.
            </p>
            <p v-if="selectedEventId && selectedEvent?.formEnabled" class="text-green-600 text-sm mt-2">
              ✓ Kayıt formu aktif
            </p>
            <p v-if="selectedEventId" class="text-xs text-gray-500 mt-2">
              Sertifika katılımı için Etkinlik Yönetimi'ndeki <b>Hareketli QR</b> ekranını kullanın.
              Bu statik form QR'ı sertifika oluşturmaz.
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">QR Ortasına Logo (Opsiyonel)</label>
            <input 
              type="file"
              @change="handleLogoUpload"
              accept="image/*"
              class="w-full border rounded-lg p-2 text-sm"
            />
            <div v-if="newQr.logoUrl" class="mt-2 flex items-center gap-2">
              <img :src="getFullUrl(newQr.logoUrl)" alt="Logo" class="w-12 h-12 object-contain rounded" />
              <span class="text-green-600 text-sm">✓ Logo yüklendi</span>
            </div>
            <span v-if="uploadingLogo" class="text-blue-500 text-sm">Yükleniyor...</span>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button 
            @click="closeCreateModal"
            class="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg"
          >
            İptal
          </button>
          <button 
            @click="createQrCode"
            :disabled="!canCreate"
            class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg"
          >
            Oluştur
          </button>
        </div>
      </div>
    </div>

    <!-- QR Image Modal -->
    <div v-if="showQrModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-8 text-center max-w-lg w-full">
        <h4 class="text-xl font-bold mb-4">📱 QR Kod</h4>
        <div class="bg-gray-50 p-6 rounded-xl inline-block">
          <img v-if="qrImageData" :src="qrImageData" alt="QR Code" class="mx-auto w-80 h-80" />
        </div>
        <p class="text-sm text-gray-500 mt-4 mb-4">Bu QR kodu taratıldığında tarama sayısı artacaktır.</p>
        <div class="flex gap-3">
          <button 
            @click="showQrModal = false"
            class="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg"
          >
            Kapat
          </button>
          <a 
            :href="qrImageData" 
            :download="`qr-${currentQrCode}.png`"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-center"
          >
            📥 İndir
          </a>
        </div>
      </div>
    </div>

    <!-- Stats Modal -->
    <div v-if="showStatsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-lg">
        <h4 class="text-xl font-bold mb-4">📊 Tarama İstatistikleri</h4>
        
        <div v-if="currentStats">
          <div class="text-center mb-6">
            <p class="text-4xl font-bold text-blue-600">{{ currentStats.totalScans }}</p>
            <p class="text-gray-500">Toplam Tarama</p>
          </div>

          <div v-if="currentStats.recentScans.length > 0">
            <h5 class="font-semibold mb-2">Son Taramalar</h5>
            <div class="max-h-48 overflow-y-auto space-y-2">
              <div 
                v-for="scan in currentStats.recentScans" 
                :key="scan.id"
                class="bg-gray-50 p-2 rounded text-sm"
              >
                <span class="text-gray-600">{{ new Date(scan.createdAt).toLocaleString('tr-TR') }}</span>
              </div>
            </div>
          </div>
          <p v-else class="text-gray-500 text-center">Henüz tarama yok.</p>
        </div>

        <button 
          @click="showStatsModal = false"
          class="w-full mt-4 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg"
        >
          Kapat
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import API_BASE_URL, { API_URL } from '../../config/api';

interface QrCode {
  id: number;
  name: string;
  targetUrl: string;
  shortCode: string;
  scanCount: number;
  isActive: boolean;
  logoUrl?: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
  formCode?: string;
  formEnabled?: boolean;
}

interface QrStats {
  totalScans: number;
  recentScans: any[];
  scansByDate: Record<string, number>;
}

const qrCodes = ref<QrCode[]>([]);
const events = ref<Event[]>([]);
const showCreateModal = ref(false);
const showQrModal = ref(false);
const showStatsModal = ref(false);
const qrImageData = ref('');
const currentQrCode = ref('');
const currentStats = ref<QrStats | null>(null);
const uploadingLogo = ref(false);
const targetType = ref<'url' | 'event'>('url');
const selectedEventId = ref<number | null>(null);

const newQr = ref({
  name: '',
  targetUrl: '',
  logoUrl: ''
});

const selectedEvent = computed(() => 
  events.value.find(e => e.id === selectedEventId.value)
);

const canCreate = computed(() => {
  if (!newQr.value.name) return false;
  if (targetType.value === 'url' && !newQr.value.targetUrl) return false;
  if (targetType.value === 'event' && !selectedEventId.value) return false;
  return true;
});

const getToken = () => localStorage.getItem('token');

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const isEventQr = (url: string) => {
  return url && url.includes('/register/');
};

const getFullUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

const onEventSelect = () => {
  if (selectedEventId.value && selectedEvent.value) {
    // Etkinlik form URL'sini oluştur - production'da beuniktisat.com, development'ta localhost
    const baseUrl = window.location.hostname === 'localhost' ? window.location.origin : 'https://beuniktisat.com';
    const formUrl = `${baseUrl}/register/${selectedEvent.value.formCode}`;
    newQr.value.targetUrl = formUrl;
  }
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  resetForm();
};

const resetForm = () => {
  newQr.value = { name: '', targetUrl: '', logoUrl: '' };
  targetType.value = 'url';
  selectedEventId.value = null;
};

const fetchEvents = async () => {
  try {
    const response = await fetch(`${API_URL}/events`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    events.value = await response.json();
  } catch (error) {
    console.error('Etkinlikler yüklenemedi:', error);
  }
};

const handleLogoUpload = async (e: globalThis.Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  uploadingLogo.value = true;
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      body: formData,
    });
    
    if (response.ok) {
      const data = await response.json();
      newQr.value.logoUrl = data.url;
    } else {
      alert('Logo yüklenemedi');
    }
  } catch (error) {
    console.error('Logo yüklenemedi:', error);
  } finally {
    uploadingLogo.value = false;
  }
};

const fetchQrCodes = async () => {
  try {
    const response = await fetch(`${API_URL}/qr-track`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    qrCodes.value = await response.json();
  } catch (error) {
    console.error('QR kodları yüklenemedi:', error);
  }
};

const createQrCode = async () => {
  if (!canCreate.value) return;

  try {
    // Eğer etkinlik seçildiyse ve form kapalıysa, önce formu aç
    if (targetType.value === 'event' && selectedEventId.value && !selectedEvent.value?.formEnabled) {
      await fetch(`${API_URL}/registrations/event/${selectedEventId.value}/toggle-form`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
    }

    const response = await fetch(`${API_URL}/qr-track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(newQr.value)
    });
    
    if (response.ok) {
      closeCreateModal();
      fetchQrCodes();
    }
  } catch (error) {
    console.error('QR kod oluşturulamadı:', error);
  }
};

const showQrImage = async (shortCode: string) => {
  try {
    const response = await fetch(`${API_URL}/qr-track/image/${shortCode}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();
    qrImageData.value = data.qrImage;
    currentQrCode.value = shortCode;
    showQrModal.value = true;
  } catch (error) {
    console.error('QR görsel alınamadı:', error);
  }
};

const openQrPage = (shortCode: string) => {
  window.open(`/qr-sayfasi/${encodeURIComponent(shortCode)}`, '_blank');
};

const viewStats = async (id: number) => {
  try {
    const response = await fetch(`${API_URL}/qr-track/stats/${id}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    currentStats.value = await response.json();
    showStatsModal.value = true;
  } catch (error) {
    console.error('İstatistikler alınamadı:', error);
  }
};

const deleteQr = async (id: number) => {
  if (!confirm('Bu QR kodu silmek istediğinize emin misiniz?')) return;
  
  try {
    await fetch(`${API_URL}/qr-track/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    fetchQrCodes();
  } catch (error) {
    console.error('QR kod silinemedi:', error);
  }
};

onMounted(() => {
  fetchQrCodes();
  fetchEvents();
});
</script>
