<template>
  <div>
    <h2 class="text-2xl font-bold mb-4 text-gray-800">Link Yönetimi</h2>

    <!-- Add New Link Form -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 class="text-lg font-semibold mb-4 text-gray-700">Yeni Link Ekle</h3>
      <form @submit.prevent="addLink" class="space-y-4">
        <div class="flex flex-col md:flex-row gap-4">
          <input
            v-model="newLink.title"
            type="text"
            placeholder="Başlık (Örn: Instagram)"
            class="border p-2 rounded flex-1"
            required
          />
          <input
            v-model="newLink.url"
            type="url"
            placeholder="URL (https://...)"
            class="border p-2 rounded flex-1"
            required
          />
        </div>
        <div class="flex flex-col md:flex-row gap-4 items-end">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Emoji İkon (Opsiyonel)</label>
            <input
              v-model="newLink.icon"
              type="text"
              placeholder="📱 veya 🌐"
              class="border p-2 rounded w-full"
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">İkon Yükle (PNG/JPG)</label>
            <div class="flex gap-2">
              <input
                type="file"
                ref="iconFileInput"
                @change="handleIconUpload"
                accept="image/*"
                class="border p-2 rounded flex-1 text-sm"
              />
              <span v-if="uploading" class="text-blue-500 text-sm self-center">Yükleniyor...</span>
            </div>
          </div>
          <button
            type="submit"
            class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-bold"
          >
            Ekle
          </button>
        </div>
        <div v-if="newLink.iconUrl" class="flex items-center gap-2">
          <span class="text-sm text-gray-500">Önizleme:</span>
          <img :src="getFullUrl(newLink.iconUrl)" alt="Icon preview" class="w-8 h-8 object-contain" />
        </div>
      </form>
    </div>

    <!-- Links List -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Sıra
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Başlık
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              URL
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Tıklanma
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Durum
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="link in links" :key="link.id">
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <input
                type="number"
                v-model.number="link.order"
                @change="updateLink(link)"
                class="w-16 border rounded p-1"
              />
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <input
                type="text"
                v-model="link.title"
                @change="updateLink(link)"
                class="w-full border-none focus:ring-0"
              />
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <a :href="link.url" target="_blank" class="text-blue-500 hover:underline truncate block max-w-xs">{{ link.url }}</a>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {{ link.clicks }}
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <button
                @click="toggleActive(link)"
                :class="link.isActive ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'"
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer"
              >
                {{ link.isActive ? 'Aktif' : 'Pasif' }}
              </button>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <button
                @click="deleteLink(link.id)"
                class="text-red-600 hover:text-red-900"
              >
                Sil
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import API_BASE_URL, { API_URL } from '../../config/api';

const links = ref<any[]>([]);
const newLink = ref({ title: '', url: '', icon: '', iconUrl: '', order: 0 });
const authStore = useAuthStore();
const uploading = ref(false);
const iconFileInput = ref<HTMLInputElement | null>(null);

const getFullUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

const handleIconUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  uploading.value = true;
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
      body: formData,
    });
    
    if (response.ok) {
      const data = await response.json();
      newLink.value.iconUrl = data.url;
    } else {
      alert('Dosya yüklenemedi');
    }
  } catch (error) {
    console.error('Dosya yüklenemedi:', error);
    alert('Dosya yüklenemedi');
  } finally {
    uploading.value = false;
  }
};

const fetchLinks = async () => {
  try {
    const response = await fetch(`${API_URL}/links`);
    links.value = await response.json();
  } catch (error) {
    console.error('Linkler yüklenemedi:', error);
  }
};

const addLink = async () => {
  try {
    const response = await fetch(`${API_URL}/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
      body: JSON.stringify(newLink.value),
    });
    if (response.ok) {
      newLink.value = { title: '', url: '', icon: '', iconUrl: '', order: 0 };
      fetchLinks();
    }
  } catch (error) {
    console.error('Link eklenemedi:', error);
  }
};

const updateLink = async (link: any) => {
  try {
    await fetch(`${API_URL}/links/${link.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
      body: JSON.stringify(link),
    });
  } catch (error) {
    console.error('Link güncellenemedi:', error);
  }
};

const toggleActive = async (link: any) => {
  link.isActive = !link.isActive;
  updateLink(link);
};

const deleteLink = async (id: number) => {
  if (!confirm('Bu linki silmek istediğinize emin misiniz?')) return;
  
  try {
    await fetch(`${API_URL}/links/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    });
    fetchLinks();
  } catch (error) {
    console.error('Link silinemedi:', error);
  }
};

onMounted(() => {
  fetchLinks();
});
</script>
