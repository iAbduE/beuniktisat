<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-800">📅 Etkinlik Yönetimi</h2>

    <!-- Add Event Form -->
    <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 class="text-lg font-semibold mb-4">➕ Yeni Etkinlik Ekle</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input v-model="newEvent.title" type="text" placeholder="Etkinlik Başlığı *" class="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        <input v-model="newEvent.date" type="datetime-local" class="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        <input v-model="newEvent.location" type="text" placeholder="Konum" class="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        
        <!-- Image Upload -->
        <div class="relative">
          <input 
            type="file" 
            accept="image/*"
            @change="handleImageSelect"
            ref="imageInput"
            class="hidden"
          />
          <div 
            @click="($refs.imageInput as HTMLInputElement)?.click()"
            class="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 flex items-center justify-between"
          >
            <span v-if="selectedImage" class="text-gray-700 truncate">{{ selectedImage.name }}</span>
            <span v-else class="text-gray-400">📷 Kapak Resmi Seç...</span>
            <span v-if="selectedImage" @click.stop="clearImage" class="text-red-500 hover:text-red-700 ml-2">✕</span>
          </div>
          <div v-if="imagePreview" class="mt-2">
            <img :src="imagePreview" class="h-20 w-auto rounded-lg object-cover" />
          </div>
        </div>
        
        <textarea v-model="newEvent.description" placeholder="Açıklama" class="p-3 border rounded-lg md:col-span-2 focus:ring-2 focus:ring-blue-500 outline-none" rows="2"></textarea>
      </div>
      <button 
        @click="addEvent" 
        :disabled="!newEvent.title || !newEvent.date"
        class="mt-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg transition-colors"
      >
        ✓ Etkinlik Ekle
      </button>
    </div>

    <!-- Event List -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-800">Etkinlikler</h3>
      
      <div v-if="events.length === 0" class="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
        <span class="text-4xl block mb-2">📅</span>
        <p>Henüz etkinlik yok.</p>
      </div>

      <div 
        v-for="event in events" 
        :key="event.id" 
        class="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
      >
        <!-- Event Header with Image -->
        <div class="flex">
          <!-- Event Image -->
          <div v-if="event.imageUrl" class="w-32 h-32 flex-shrink-0">
            <img 
              :src="getImageUrl(event.imageUrl)" 
              :alt="event.title"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
          </div>
          
          <div class="flex-1 p-4 border-b border-gray-100">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <h4 class="text-lg font-bold text-gray-800">{{ event.title }}</h4>
                  <span 
                    :class="event.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                    class="text-xs px-2 py-1 rounded-full font-medium"
                  >
                    {{ event.isActive ? '✓ Aktif' : 'Pasif' }}
                  </span>
                </div>
                <div class="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span>📅 {{ formatDate(event.date) }}</span>
                  <span v-if="event.location">📍 {{ event.location }}</span>
                </div>
              </div>
              <div class="flex gap-2">
                <button 
                  @click="toggleStatus(event)" 
                  :class="event.isActive ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'"
              class="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
            >
              {{ event.isActive ? 'Gizle' : 'Yayınla' }}
            </button>
            <button 
              @click="deleteEvent(event.id)" 
              class="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
            >
              Sil
            </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Form & Registration Section -->
        <div class="p-4 bg-gray-50">
          <div class="flex flex-wrap items-center gap-4">
            <!-- Form Toggle -->
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-700">Kayıt Formu:</span>
              <button 
                @click="toggleForm(event)"
                :class="event.formEnabled ? 'bg-green-600' : 'bg-gray-400'"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              >
                <span 
                  :class="event.formEnabled ? 'translate-x-6' : 'translate-x-1'"
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                ></span>
              </button>
              <span :class="event.formEnabled ? 'text-green-600' : 'text-gray-500'" class="text-sm">
                {{ event.formEnabled ? 'Açık' : 'Kapalı' }}
              </span>
            </div>

            <!-- Form Link -->
            <div v-if="event.formEnabled && event.formCode" class="flex items-center gap-2">
              <input 
                :value="getFormUrl(event.formCode)" 
                readonly 
                class="text-xs bg-white border rounded px-2 py-1 w-64"
              />
              <button 
                @click="copyFormLink(event.formCode)"
                class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                📋 Kopyala
              </button>
              <button 
                @click="openProjectionScreen(event)"
                class="bg-cyan-600 text-white px-3 py-1 rounded text-sm hover:bg-cyan-700"
              >
                📽️ Yansıt
              </button>
            </div>

            <!-- View Registrations -->
            <button 
              @click="viewRegistrations(event)"
              class="bg-indigo-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-indigo-700 font-medium"
            >
              👥 Kayıtlar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Registrations Modal -->
    <div 
      v-if="showRegistrationsModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showRegistrationsModal = false"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div class="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold">📋 {{ selectedEvent?.title }} - Kayıtlar</h3>
          <button @click="showRegistrationsModal = false" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div class="p-4 overflow-y-auto max-h-[60vh]">
          <div v-if="registrations.length === 0" class="text-center py-8 text-gray-500">
            Henüz kayıt yok.
          </div>
          <table v-else class="w-full">
            <thead>
              <tr class="border-b text-left text-sm text-gray-600">
                <th class="pb-2">Ad Soyad</th>
                <th class="pb-2">E-posta</th>
                <th class="pb-2">Okul No</th>
                <th class="pb-2">Telefon</th>
                <th class="pb-2">Bölüm</th>
                <th class="pb-2">Tarih</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reg in registrations" :key="reg.id" class="border-b hover:bg-gray-50">
                <td class="py-2 font-medium">{{ reg.name }}</td>
                <td class="py-2 text-sm">{{ reg.email }}</td>
                <td class="py-2 text-sm">{{ reg.studentId || '-' }}</td>
                <td class="py-2 text-sm">{{ reg.phone || '-' }}</td>
                <td class="py-2 text-sm">{{ reg.department || '-' }}</td>
                <td class="py-2 text-sm text-gray-500">{{ formatDate(reg.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="p-4 border-t bg-gray-50 flex justify-between items-center">
          <span class="text-sm text-gray-600">Toplam: {{ registrations.length }} kayıt</span>
          <button 
            @click="exportRegistrations"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            📥 Excel'e Aktar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { API_URL } from '../../config/api';

interface EventRegistration {
  id: number;
  name: string;
  email: string;
  studentId?: string;
  phone?: string;
  department?: string;
  createdAt: string;
}

interface Event {
  id: number;
  title: string;
  description?: string;
  date: string;
  location?: string;
  imageUrl?: string;
  isActive: boolean;
  formCode?: string;
  projectionCode?: string;
  formEnabled?: boolean;
}

const events = ref<Event[]>([]);
const registrations = ref<EventRegistration[]>([]);
const selectedEvent = ref<Event | null>(null);
const showRegistrationsModal = ref(false);

const newEvent = ref({
  title: '',
  description: '',
  date: '',
  location: '',
});

const selectedImage = ref<File | null>(null);
const imagePreview = ref<string>('');
const imageInput = ref<HTMLInputElement | null>(null);

const handleImageSelect = (e: any) => {
  const file = e.target?.files?.[0];
  if (file) {
    selectedImage.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const clearImage = () => {
  selectedImage.value = null;
  imagePreview.value = '';
  if (imageInput.value) {
    imageInput.value.value = '';
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getImageUrl = (url?: string) => {
  if (!url) return '';
  // Nginx üzerinden serve ediliyor, relative path kullan
  if (url.startsWith('/uploads/')) {
    return url;
  }
  return url;
};

const handleImageError = (e: any) => {
  e.target.style.display = 'none';
};

const getFormUrl = (formCode?: string) => {
  if (!formCode) return '';
  // Production'da beuniktisat.com, development'ta localhost
  const baseUrl = window.location.hostname === 'localhost' ? window.location.origin : 'https://beuniktisat.com';
  return `${baseUrl}/register/${formCode}`;
};

const fetchEvents = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/events`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    events.value = await response.json();
  } catch (error) {
    console.error('Etkinlikler yüklenemedi:', error);
  }
};

const addEvent = async () => {
  if (!newEvent.value.title || !newEvent.value.date) return;

  try {
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('title', newEvent.value.title);
    formData.append('date', newEvent.value.date);
    if (newEvent.value.description) formData.append('description', newEvent.value.description);
    if (newEvent.value.location) formData.append('location', newEvent.value.location);
    if (selectedImage.value) formData.append('image', selectedImage.value);

    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (response.ok) {
      newEvent.value = { title: '', description: '', date: '', location: '' };
      clearImage();
      fetchEvents();
    }
  } catch (error) {
    console.error('Etkinlik eklenemedi:', error);
  }
};

const toggleStatus = async (event: Event) => {
  try {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/events/${event.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ isActive: !event.isActive })
    });
    fetchEvents();
  } catch (error) {
    console.error('Durum güncellenemedi:', error);
  }
};

const toggleForm = async (event: Event) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/registrations/event/${event.id}/toggle-form`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      fetchEvents();
    }
  } catch (error) {
    console.error('Form durumu güncellenemedi:', error);
  }
};

const copyFormLink = async (formCode: string) => {
  const url = getFormUrl(formCode);
  await navigator.clipboard.writeText(url);
  alert('Link kopyalandı!');
};

const openProjectionScreen = (event: Event) => {
  if (!event.projectionCode) {
    alert('Bu etkinlik için projeksiyon anahtarı bulunamadı.');
    return;
  }
  window.open(`/katilim/${encodeURIComponent(event.projectionCode)}`, '_blank');
};

const viewRegistrations = async (event: Event) => {
  selectedEvent.value = event;
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/registrations/event/${event.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      registrations.value = await response.json();
      showRegistrationsModal.value = true;
    }
  } catch (error) {
    console.error('Kayıtlar yüklenemedi:', error);
  }
};

const exportRegistrations = () => {
  if (registrations.value.length === 0) return;
  
  const headers = ['Ad Soyad', 'E-posta', 'Okul No', 'Telefon', 'Bölüm', 'Kayıt Tarihi'];
  const rows = registrations.value.map(r => [
    r.name,
    r.email,
    r.studentId || '',
    r.phone || '',
    r.department || '',
    new Date(r.createdAt).toLocaleDateString('tr-TR')
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${selectedEvent.value?.title || 'kayitlar'}-kayitlar.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const deleteEvent = async (id: number) => {
  if (!confirm('Bu etkinliği silmek istediğinize emin misiniz?')) return;

  try {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/events/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchEvents();
  } catch (error) {
    console.error('Etkinlik silinemedi:', error);
  }
};

onMounted(fetchEvents);
</script>
