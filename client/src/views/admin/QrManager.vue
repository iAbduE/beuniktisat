<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-xl font-semibold mb-4 text-gray-800">QR Kod Oluşturucu</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Form Section -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">QR İçeriği (URL veya Metin)</label>
          <input 
            v-model="qrText" 
            type="text" 
            placeholder="https://beuniktisat.com"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Renk</label>
          <input 
            v-model="qrColor" 
            type="color" 
            class="h-10 w-full cursor-pointer border border-gray-300 rounded-md"
          />
        </div>

        <div class="pt-4">
          <button 
            @click="generateQR" 
            :disabled="!qrText || loading"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50"
          >
            {{ loading ? 'Oluşturuluyor...' : 'QR Kod Oluştur' }}
          </button>
        </div>
      </div>

      <!-- Preview Section -->
      <div class="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div v-if="qrImage" class="text-center">
          <img :src="qrImage" alt="Generated QR Code" class="mx-auto mb-4 shadow-lg rounded-lg border-4 border-white" />
          <a 
            :href="qrImage" 
            download="qrcode.png"
            class="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            İndir (PNG)
          </a>
        </div>
        <div v-else class="text-gray-400 text-center">
          <span class="text-4xl block mb-2">📱</span>
          <p>Önizleme için QR kod oluşturun</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { API_URL } from '../../config/api';

const qrText = ref('');
const qrColor = ref('#000000');
const qrImage = ref<string | null>(null);
const loading = ref(false);

const generateQR = async () => {
  if (!qrText.value) return;

  loading.value = true;
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/qr/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        text: qrText.value,
        color: qrColor.value
      })
    });

    if (response.ok) {
      const data = await response.json();
      qrImage.value = data.qrDataUrl;
    } else {
      console.error('QR oluşturma hatası');
    }
  } catch (error) {
    console.error('QR oluşturma hatası:', error);
  } finally {
    loading.value = false;
  }
};
</script>
