<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Video Galeri Yönetimi</h2>

    <!-- Add Video Form -->
    <div class="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 class="text-lg font-semibold mb-4 text-gray-700">Yeni Video Ekle</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          v-model="newVideo.title" 
          type="text" 
          placeholder="Video Başlığı" 
          class="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input 
          v-model="newVideo.url" 
          type="text" 
          placeholder="YouTube URL (Örn: https://youtu.be/...)" 
          class="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <button 
        @click="addVideo" 
        class="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors flex items-center"
      >
        <span class="mr-2">➕</span> Ekle
      </button>
    </div>

    <!-- Video List -->
    <div class="space-y-4">
      <div 
        v-for="video in videos" 
        :key="video.id" 
        class="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow"
      >
        <div class="flex items-center space-x-4">
          <div class="text-red-600 text-2xl">▶</div>
          <div>
            <h4 class="font-bold text-gray-800">{{ video.title }}</h4>
            <a :href="video.url" target="_blank" class="text-sm text-blue-500 hover:underline">{{ video.url }}</a>
          </div>
        </div>
        <button 
          @click="deleteVideo(video.id)" 
          class="text-red-500 hover:text-red-700 p-2"
          title="Sil"
        >
          🗑️
        </button>
      </div>
      <div v-if="videos.length === 0" class="text-center text-gray-500 py-8">
        Henüz hiç video eklenmemiş.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { API_URL } from '../../config/api';

const videos = ref<any[]>([]);
const newVideo = ref({ title: '', url: '' });

const fetchVideos = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/videos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      videos.value = await response.json();
    }
  } catch (error) {
    console.error('Videolar yüklenirken hata:', error);
  }
};

const addVideo = async () => {
  if (!newVideo.value.title || !newVideo.value.url) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newVideo.value)
    });

    if (response.ok) {
      newVideo.value = { title: '', url: '' };
      fetchVideos();
    } else {
      alert('Video eklenirken bir hata oluştu.');
    }
  } catch (error) {
    console.error('Hata:', error);
  }
};

const deleteVideo = async (id: number) => {
  if (!confirm('Bu videoyu silmek istediğinize emin misiniz?')) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/videos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      fetchVideos();
    }
  } catch (error) {
    console.error('Silme hatası:', error);
  }
};

onMounted(fetchVideos);
</script>
