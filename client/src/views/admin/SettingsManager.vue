<template>
  <div class="space-y-6">
    <h3 class="text-2xl font-bold text-gray-800">Site Ayarları</h3>

    <!-- Background Settings -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h4 class="text-lg font-semibold mb-4">🎨 Arka Plan Ayarları</h4>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Arka Plan Tipi</label>
          <select v-model="settings.backgroundType" class="w-full border rounded-lg p-2">
            <option value="gradient">Gradient (Geçişli Renk)</option>
            <option value="solid">Düz Renk</option>
            <option value="image">Görsel</option>
          </select>
        </div>

        <div v-if="settings.backgroundType === 'solid'">
          <label class="block text-sm font-medium text-gray-700 mb-2">Arka Plan Rengi</label>
          <input 
            type="color" 
            v-model="settings.backgroundColor" 
            class="w-20 h-10 rounded cursor-pointer"
          />
        </div>

        <div v-if="settings.backgroundType === 'image'">
          <label class="block text-sm font-medium text-gray-700 mb-2">Arka Plan Görseli URL</label>
          <input 
            type="url" 
            v-model="settings.backgroundImage" 
            placeholder="https://example.com/background.jpg"
            class="w-full border rounded-lg p-2"
          />
          <div v-if="settings.backgroundImage" class="mt-2">
            <img :src="settings.backgroundImage" alt="Preview" class="h-32 object-cover rounded-lg" />
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Settings -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h4 class="text-lg font-semibold mb-4">👤 Profil Ayarları</h4>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Profil Resmi URL</label>
          <input 
            type="url" 
            v-model="settings.profileImage" 
            placeholder="https://example.com/logo.png"
            class="w-full border rounded-lg p-2"
          />
          <div v-if="settings.profileImage" class="mt-2">
            <img :src="settings.profileImage" alt="Preview" class="w-20 h-20 object-cover rounded-full" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Başlık</label>
          <input 
            type="text" 
            v-model="settings.profileTitle" 
            class="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Alt Başlık</label>
          <input 
            type="text" 
            v-model="settings.profileSubtitle" 
            class="w-full border rounded-lg p-2"
          />
        </div>
      </div>
    </div>

    <!-- Preview -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h4 class="text-lg font-semibold mb-4">👁️ Önizleme</h4>
      <div 
        class="h-64 rounded-lg flex flex-col items-center justify-center"
        :style="previewStyle"
      >
        <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2 overflow-hidden">
          <img v-if="settings.profileImage" :src="settings.profileImage" class="w-full h-full object-cover" />
          <span v-else class="text-white text-xl font-bold">BEÜ</span>
        </div>
        <p class="text-white font-bold">{{ settings.profileTitle }}</p>
        <p class="text-white/70 text-sm">{{ settings.profileSubtitle }}</p>
      </div>
    </div>

    <!-- Save Button -->
    <button 
      @click="saveSettings"
      :disabled="saving"
      class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
    >
      {{ saving ? 'Kaydediliyor...' : '💾 Ayarları Kaydet' }}
    </button>

    <p v-if="message" :class="messageClass" class="text-center p-3 rounded-lg">
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { API_URL } from '../../config/api';

interface Settings {
  backgroundType: string;
  backgroundColor: string;
  backgroundGradient: string;
  backgroundImage: string;
  profileImage: string;
  profileTitle: string;
  profileSubtitle: string;
}

const settings = ref<Settings>({
  backgroundType: 'gradient',
  backgroundColor: '#1e3a8a',
  backgroundGradient: 'from-blue-900 to-gray-900',
  backgroundImage: '',
  profileImage: '',
  profileTitle: 'BEÜ İktisat Topluluğu',
  profileSubtitle: 'Ekonomi, Finans ve Gelecek'
});

const saving = ref(false);
const message = ref('');
const messageClass = ref('');

const previewStyle = computed(() => {
  if (settings.value.backgroundType === 'image' && settings.value.backgroundImage) {
    return {
      backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${settings.value.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  } else if (settings.value.backgroundType === 'solid' && settings.value.backgroundColor) {
    return {
      backgroundColor: settings.value.backgroundColor
    };
  } else {
    return {
      background: 'linear-gradient(135deg, #1e3a8a 0%, #111827 100%)'
    };
  }
});

const fetchSettings = async () => {
  try {
    const response = await fetch(`${API_URL}/settings`);
    const data = await response.json();
    if (data) {
      settings.value = { ...settings.value, ...data };
    }
  } catch (error) {
    console.error('Ayarlar yüklenemedi:', error);
  }
};

const saveSettings = async () => {
  saving.value = true;
  message.value = '';
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings.value)
    });
    
    if (response.ok) {
      message.value = '✅ Ayarlar başarıyla kaydedildi!';
      messageClass.value = 'bg-green-100 text-green-800';
    } else {
      throw new Error('Kaydetme başarısız');
    }
  } catch (error) {
    message.value = '❌ Ayarlar kaydedilemedi.';
    messageClass.value = 'bg-red-100 text-red-800';
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchSettings();
});
</script>
