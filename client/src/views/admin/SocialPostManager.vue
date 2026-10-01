<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Sosyal Medya Gönderileri</h2>

    <!-- Add Post Form -->
    <div class="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 class="text-lg font-semibold mb-4 text-gray-700">Yeni Gönderi Ekle</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select 
          v-model="newPost.platform" 
          class="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="INSTAGRAM">Instagram</option>
          <option value="TWITTER">Twitter / X</option>
        </select>
        <input 
          v-model="newPost.url" 
          type="text" 
          placeholder="Gönderi Linki (URL)" 
          class="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <button 
        @click="addPost" 
        class="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors flex items-center"
      >
        <span class="mr-2">➕</span> Ekle
      </button>
    </div>

    <!-- Post List -->
    <div class="space-y-4">
      <div 
        v-for="post in posts" 
        :key="post.id" 
        class="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow"
      >
        <div class="flex items-center space-x-4">
          <div class="text-2xl">
            <span v-if="post.platform === 'INSTAGRAM'">📸</span>
            <span v-else-if="post.platform === 'TWITTER'">🐦</span>
            <span v-else>🔗</span>
          </div>
          <div>
            <h4 class="font-bold text-gray-800">{{ post.platform }}</h4>
            <a :href="post.url" target="_blank" class="text-sm text-blue-500 hover:underline truncate block max-w-xs">{{ post.url }}</a>
          </div>
        </div>
        <button 
          @click="deletePost(post.id)" 
          class="text-red-500 hover:text-red-700 p-2"
          title="Sil"
        >
          🗑️
        </button>
      </div>
      <div v-if="posts.length === 0" class="text-center text-gray-500 py-8">
        Henüz hiç gönderi eklenmemiş.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { API_URL } from '../../config/api';

const posts = ref<any[]>([]);
const newPost = ref({ platform: 'INSTAGRAM', url: '' });

const fetchPosts = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/social-posts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      posts.value = await response.json();
    }
  } catch (error) {
    console.error('Gönderiler yüklenirken hata:', error);
  }
};

const addPost = async () => {
  if (!newPost.value.url) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/social-posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newPost.value)
    });

    if (response.ok) {
      newPost.value.url = '';
      fetchPosts();
    } else {
      alert('Gönderi eklenirken bir hata oluştu.');
    }
  } catch (error) {
    console.error('Hata:', error);
  }
};

const deletePost = async (id: number) => {
  if (!confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/social-posts/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      fetchPosts();
    }
  } catch (error) {
    console.error('Silme hatası:', error);
  }
};

onMounted(fetchPosts);
</script>
