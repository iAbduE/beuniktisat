<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-xl font-semibold mb-4 text-gray-800">Sponsor / Reklam Yönetimi</h2>

    <!-- Add Sponsor Form -->
    <div class="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 class="text-lg font-medium mb-3">Yeni Sponsor Ekle</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input v-model="newSponsor.name" type="text" placeholder="Sponsor Adı" class="p-2 border rounded" />
        <input v-model="newSponsor.imageUrl" type="text" placeholder="Logo URL" class="p-2 border rounded" />
        <input v-model="newSponsor.redirectUrl" type="text" placeholder="Yönlendirme Linki" class="p-2 border rounded md:col-span-2" />
      </div>
      <button 
        @click="addSponsor" 
        class="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-200"
      >
        Ekle
      </button>
    </div>

    <!-- Sponsor List -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div 
        v-for="sponsor in sponsors" 
        :key="sponsor.id" 
        class="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative"
      >
        <div class="absolute top-2 right-2 flex space-x-2">
          <button 
            @click="toggleStatus(sponsor)" 
            :class="sponsor.isActive ? 'text-green-500' : 'text-gray-400'"
            class="hover:text-green-700"
          >
            <span v-if="sponsor.isActive">Aktif</span>
            <span v-else>Pasif</span>
          </button>
          <button @click="deleteSponsor(sponsor.id)" class="text-red-500 hover:text-red-700">Sil</button>
        </div>
        
        <img :src="sponsor.imageUrl" :alt="sponsor.name" class="h-16 mx-auto object-contain mb-4" />
        <h3 class="text-center font-bold text-gray-800">{{ sponsor.name }}</h3>
        <p class="text-center text-xs text-gray-500 truncate">{{ sponsor.redirectUrl }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { API_URL } from '../../config/api';

const sponsors = ref<any[]>([]);
const newSponsor = ref({
  name: '',
  imageUrl: '',
  redirectUrl: '',
});

const fetchSponsors = async () => {
  try {
    const response = await fetch(`${API_URL}/sponsors`);
    sponsors.value = await response.json();
  } catch (error) {
    console.error('Sponsorlar yüklenemedi:', error);
  }
};

const addSponsor = async () => {
  if (!newSponsor.value.name || !newSponsor.value.imageUrl) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/sponsors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newSponsor.value)
    });

    if (response.ok) {
      newSponsor.value = { name: '', imageUrl: '', redirectUrl: '' };
      fetchSponsors();
    }
  } catch (error) {
    console.error('Sponsor eklenemedi:', error);
  }
};

const toggleStatus = async (sponsor: any) => {
  try {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/sponsors/${sponsor.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ isActive: !sponsor.isActive })
    });
    fetchSponsors();
  } catch (error) {
    console.error('Durum güncellenemedi:', error);
  }
};

const deleteSponsor = async (id: number) => {
  if (!confirm('Bu sponsoru silmek istediğinize emin misiniz?')) return;

  try {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/sponsors/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    fetchSponsors();
  } catch (error) {
    console.error('Sponsor silinemedi:', error);
  }
};

onMounted(() => {
  fetchSponsors();
});
</script>
