<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-xl font-semibold mb-4 text-gray-800">Duyuru Yönetimi</h2>

    <!-- Add Announcement Form -->
    <div class="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 class="text-lg font-medium mb-3">Yeni Duyuru Ekle</h3>
      <div class="space-y-4">
        <input v-model="newAnnouncement.title" type="text" placeholder="Başlık" class="w-full p-2 border rounded" />
        <textarea v-model="newAnnouncement.content" placeholder="İçerik" class="w-full p-2 border rounded" rows="3"></textarea>
      </div>
      <button 
        @click="addAnnouncement" 
        class="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-200"
      >
        Yayınla
      </button>
    </div>

    <!-- Announcement List -->
    <div class="space-y-4">
      <div 
        v-for="announcement in announcements" 
        :key="announcement.id" 
        class="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold text-gray-800">{{ announcement.title }}</h3>
            <p class="text-gray-600 text-sm mt-1">{{ announcement.content }}</p>
            <span class="text-xs text-gray-400 mt-2 block">
              {{ new Date(announcement.createdAt).toLocaleDateString('tr-TR') }}
            </span>
          </div>
          <div class="flex flex-col space-y-2 ml-4">
            <button 
              @click="toggleStatus(announcement)" 
              :class="announcement.isActive ? 'text-green-500' : 'text-gray-400'"
              class="text-sm hover:text-green-700"
            >
              {{ announcement.isActive ? 'Aktif' : 'Pasif' }}
            </button>
            <button @click="deleteAnnouncement(announcement.id)" class="text-red-500 hover:text-red-700 text-sm">Sil</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { API_URL } from '../../config/api';

const announcements = ref<any[]>([]);
const newAnnouncement = ref({
  title: '',
  content: '',
});

const fetchAnnouncements = async () => {
  try {
    const response = await fetch(`${API_URL}/announcements`);
    announcements.value = await response.json();
  } catch (error) {
    console.error('Duyurular yüklenemedi:', error);
  }
};

const addAnnouncement = async () => {
  if (!newAnnouncement.value.title || !newAnnouncement.value.content) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newAnnouncement.value)
    });

    if (response.ok) {
      newAnnouncement.value = { title: '', content: '' };
      fetchAnnouncements();
    }
  } catch (error) {
    console.error('Duyuru eklenemedi:', error);
  }
};

const toggleStatus = async (announcement: any) => {
  try {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/announcements/${announcement.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ isActive: !announcement.isActive })
    });
    fetchAnnouncements();
  } catch (error) {
    console.error('Durum güncellenemedi:', error);
  }
};

const deleteAnnouncement = async (id: number) => {
  if (!confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;

  try {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/announcements/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    fetchAnnouncements();
  } catch (error) {
    console.error('Duyuru silinemedi:', error);
  }
};

onMounted(() => {
  fetchAnnouncements();
});
</script>
