<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Üye Yönetimi</h2>
      <button
        @click="exportMembers"
        :disabled="members.length === 0"
        class="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
      >
        📥 Excel'e Aktar ({{ members.length }})
      </button>
    </div>

    <!-- Add Member Form -->
    <div class="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 class="text-lg font-semibold mb-4 text-gray-700">Yeni Üye Kaydı</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          v-model="newMember.name" 
          type="text" 
          placeholder="Ad Soyad" 
          class="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input 
          v-model="newMember.email" 
          type="email" 
          placeholder="E-posta" 
          class="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input 
          v-model="newMember.studentId" 
          type="text" 
          placeholder="Öğrenci No" 
          class="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input 
          v-model="newMember.department" 
          type="text" 
          placeholder="Bölüm" 
          class="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <button 
        @click="addMember" 
        class="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors flex items-center"
      >
        <span class="mr-2">💾</span> Kaydet
      </button>
    </div>

    <!-- Member List -->
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border rounded-lg overflow-hidden">
        <thead>
          <tr class="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
            <th class="py-3 px-6 text-left">Ad Soyad</th>
            <th class="py-3 px-6 text-left">Öğrenci No</th>
            <th class="py-3 px-6 text-left">Bölüm</th>
            <th class="py-3 px-6 text-center">Dijital Kart</th>
            <th class="py-3 px-6 text-center">İşlemler</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          <tr v-for="member in members" :key="member.id" class="border-b border-gray-200 hover:bg-gray-50">
            <td class="py-3 px-6 text-left whitespace-nowrap font-medium">{{ member.name }}</td>
            <td class="py-3 px-6 text-left">{{ member.studentId }}</td>
            <td class="py-3 px-6 text-left">{{ member.department }}</td>
            <td class="py-3 px-6 text-center">
              <a 
                :href="`/card/${member.qrCode}`" 
                target="_blank" 
                class="bg-purple-100 text-purple-600 py-1 px-3 rounded-full text-xs font-bold hover:bg-purple-200"
              >
                Görüntüle
              </a>
            </td>
            <td class="py-3 px-6 text-center">
              <button 
                @click="deleteMember(member.id)" 
                class="text-red-500 hover:text-red-700 transform hover:scale-110 transition-transform"
                title="Sil"
              >
                🗑️
              </button>
            </td>
          </tr>
          <tr v-if="members.length === 0">
            <td colspan="5" class="py-4 text-center text-gray-500">Henüz üye kaydı yok.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { API_URL } from '../../config/api';
import { exportToCsv } from '../../utils/csv';

const members = ref<any[]>([]);
const newMember = ref({ name: '', email: '', studentId: '', department: '' });

const exportMembers = () => {
  exportToCsv(
    members.value,
    [
      { key: 'name', label: 'Ad Soyad' },
      { key: 'email', label: 'E-posta' },
      { key: 'studentId', label: 'Öğrenci No' },
      { key: 'department', label: 'Bölüm' },
      { key: 'qrCode', label: 'QR Kodu' },
    ],
    'uyeler'
  );
};

const fetchMembers = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/members`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      members.value = await response.json();
    }
  } catch (error) {
    console.error('Üyeler yüklenirken hata:', error);
  }
};

const addMember = async () => {
  if (!newMember.value.name || !newMember.value.email) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newMember.value)
    });

    if (response.ok) {
      newMember.value = { name: '', email: '', studentId: '', department: '' };
      fetchMembers();
    } else {
      const data = await response.json();
      alert(data.error || 'Üye eklenirken bir hata oluştu.');
    }
  } catch (error) {
    console.error('Hata:', error);
  }
};

const deleteMember = async (id: number) => {
  if (!confirm('Bu üyeyi silmek istediğinize emin misiniz?')) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/members/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      fetchMembers();
    }
  } catch (error) {
    console.error('Silme hatası:', error);
  }
};

onMounted(fetchMembers);
</script>
