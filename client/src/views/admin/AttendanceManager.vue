<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Yoklama Sistemi</h2>

    <!-- Event Selection -->
    <div class="mb-6">
      <label class="block text-gray-700 text-sm font-bold mb-2">Etkinlik Seçin:</label>
      <select 
        v-model="selectedEventId" 
        @change="fetchAttendance"
        class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option :value="null">Bir etkinlik seçin...</option>
        <option v-for="event in events" :key="event.id" :value="event.id">
          {{ event.title }} ({{ new Date(event.date).toLocaleDateString('tr-TR') }})
        </option>
      </select>
    </div>

    <div v-if="selectedEventId" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- QR Input / Scanner -->
      <div class="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 class="text-lg font-bold mb-4 text-blue-800">Yoklama Al</h3>
        
        <!-- Kamera / Manuel Seçimi -->
        <div class="flex space-x-2 mb-4">
          <button
            @click="inputMode = 'manual'"
            :class="inputMode === 'manual' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
            class="flex-1 px-4 py-2 rounded font-semibold transition-colors"
          >
            ⌨️ Manuel Giriş
          </button>
          <button
            @click="toggleCamera"
            :class="inputMode === 'camera' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
            class="flex-1 px-4 py-2 rounded font-semibold transition-colors"
          >
            📷 Kamera
          </button>
        </div>

        <!-- Manuel Giriş -->
        <div v-if="inputMode === 'manual'">
          <p class="text-sm text-blue-600 mb-4">Üyenin QR kodunu veya öğrenci numarasını girin.</p>
          <div class="flex space-x-2">
            <input 
              v-model="qrInput" 
              @keyup.enter="recordAttendance"
              type="text" 
              placeholder="QR Kod / Öğrenci No" 
              class="flex-1 p-3 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              ref="qrInputRef"
            />
            <button 
              @click="recordAttendance" 
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold"
            >
              OK
            </button>
          </div>
        </div>

        <!-- Kamera Tarama -->
        <div v-if="inputMode === 'camera'" class="space-y-4">
          <p class="text-sm text-blue-600">Üyenin QR kodunu kameraya gösterin.</p>

          <!-- Kamera Görüntüsü -->
          <div class="relative bg-black rounded-lg overflow-hidden aspect-square max-w-sm mx-auto">
            <video
              ref="videoRef"
              class="w-full h-full object-cover"
              :class="{ 'scale-x-[-1]': facingMode === 'user' }"
              playsinline
            ></video>
            <!-- Tarama Çerçevesi -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-3/4 h-3/4 border-4 border-white/50 rounded-lg"></div>
            </div>
            <!-- Kamera Değiştir Butonu -->
            <button
              @click="switchCamera"
              :disabled="isSwitchingCamera"
              class="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full w-11 h-11 flex items-center justify-center backdrop-blur-sm transition-colors disabled:opacity-50"
              title="Ön / Arka Kamera Değiştir"
            >
              🔄
            </button>
            <span class="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              {{ facingMode === 'environment' ? '📷 Arka Kamera' : '🤳 Ön Kamera' }}
            </span>
            <canvas ref="canvasRef" class="hidden"></canvas>
          </div>

          <!-- Kamera Durumu -->
          <div v-if="cameraError" class="text-red-500 text-sm text-center">
            {{ cameraError }}
          </div>
          <div v-else-if="isScanning" class="text-green-600 text-sm text-center flex items-center justify-center">
            <span class="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
            Taranıyor...
          </div>
        </div>

        <p v-if="lastMessage" :class="{'text-green-600': lastStatus === 'success', 'text-red-600': lastStatus === 'error'}" class="mt-4 font-semibold text-center">
          {{ lastMessage }}
        </p>
      </div>

      <!-- Attendance List -->
      <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-800">Katılımcı Listesi</h3>
          <div class="flex items-center gap-2">
            <button
              @click="exportAttendance"
              :disabled="attendanceList.length === 0"
              class="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              title="Excel'e Aktar"
            >
              📥 Excel
            </button>
            <span class="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
              {{ attendanceList.length }} Kişi
            </span>
          </div>
        </div>
        
        <ul class="space-y-2 max-h-96 overflow-y-auto">
          <li 
            v-for="record in attendanceList" 
            :key="record.id" 
            class="bg-white p-3 rounded shadow-sm flex justify-between items-center"
          >
            <div>
              <span class="font-medium text-gray-700 block">{{ record.member.name }}</span>
              <span class="text-xs text-gray-500">{{ new Date(record.createdAt).toLocaleTimeString('tr-TR') }}</span>
            </div>
             <button
               v-if="record.source === 'EVENT_QR'"
               @click="downloadCertificate(record.member.id)" 
               class="text-blue-500 hover:text-blue-700 text-xs border border-blue-500 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
               title="Sertifika İndir"
             >
               📄 Sertifika
             </button>
             <span
               v-else
               class="text-gray-400 text-[10px] text-right max-w-24"
               title="Sertifika için projeksiyondaki hareketli QR okutulmalıdır"
             >
               Hareketli QR gerekli
             </span>
          </li>
          <li v-if="attendanceList.length === 0" class="text-gray-500 text-sm text-center py-4">
            Henüz katılım yok.
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { API_URL } from '../../config/api';
import { exportToCsv } from '../../utils/csv';
// @ts-ignore
import jsQRLib from 'jsqr';

const events = ref<any[]>([]);
const selectedEventId = ref<number | null>(null);
const qrInput = ref('');
const attendanceList = ref<any[]>([]);
const lastMessage = ref('');
const lastStatus = ref<'success' | 'error'>('success');
const qrInputRef = ref<HTMLInputElement | null>(null);

// Kamera değişkenleri
const inputMode = ref<'manual' | 'camera'>('manual');
const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const cameraError = ref('');
const isScanning = ref(false);
const facingMode = ref<'environment' | 'user'>('environment');
const isSwitchingCamera = ref(false);
let mediaStream: MediaStream | null = null;
let scanInterval: number | null = null;
let lastScannedCode = '';
let lastScanTime = 0;

const fetchEvents = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/events`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      events.value = await response.json();
    }
  } catch (error) {
    console.error('Etkinlikler yüklenemedi:', error);
  }
};

const toggleCamera = async () => {
  if (inputMode.value === 'camera') {
    stopCamera();
    inputMode.value = 'manual';
    return;
  }
  
  inputMode.value = 'camera';
  await nextTick();
  await startCamera();
};

const startCamera = async () => {
  cameraError.value = '';
  
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: facingMode.value,
        width: { ideal: 640 },
        height: { ideal: 640 }
      }
    });

    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream;
      await videoRef.value.play();
      isScanning.value = true;
      startScanning();
    }
  } catch (err: any) {
    console.error('Kamera erişim hatası:', err);
    if (err.name === 'NotAllowedError') {
      cameraError.value = 'Kamera izni verilmedi. Lütfen tarayıcı ayarlarından izin verin.';
    } else if (err.name === 'NotFoundError') {
      cameraError.value = 'Kamera bulunamadı. Cihazınızda kamera olduğundan emin olun.';
    } else {
      cameraError.value = 'Kamera başlatılamadı: ' + err.message;
    }
  }
};

const startScanning = () => {
  if (scanInterval) clearInterval(scanInterval);
  
  scanInterval = window.setInterval(() => {
    scanFrame();
  }, 200); // Her 200ms'de bir tara
};

const scanFrame = () => {
  if (!videoRef.value || !canvasRef.value || !isScanning.value) return;
  
  const video = videoRef.value;
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  
  if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return;
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQRLib(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'dontInvert'
  });
  
  if (code) {
    const now = Date.now();
    // Aynı kodu 3 saniye içinde tekrar okuma
    if (code.data !== lastScannedCode || now - lastScanTime > 3000) {
      lastScannedCode = code.data;
      lastScanTime = now;
      handleScannedCode(code.data);
    }
  }
};

const handleScannedCode = async (code: string) => {
  // QR kodundan öğrenci numarasını çıkar
  // URL formatı: /api/qr-track/scan/XXXXXX veya sadece numara olabilir
  let studentId = code;
  
  // URL içeriyorsa, sadece gerekli kısmı al
  if (code.includes('/')) {
    // QR kodu bir URL ise, son kısmı al
    const parts = code.split('/');
    studentId = parts[parts.length - 1] || code;
  }
  
  qrInput.value = studentId;
  await recordAttendance();
};

const switchCamera = async () => {
  if (isSwitchingCamera.value) return;
  isSwitchingCamera.value = true;

  facingMode.value = facingMode.value === 'environment' ? 'user' : 'environment';
  stopCamera();
  await startCamera();

  isSwitchingCamera.value = false;
};

const stopCamera = () => {
  isScanning.value = false;
  
  if (scanInterval) {
    clearInterval(scanInterval);
    scanInterval = null;
  }
  
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  
  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }
};

// Etkinlik değiştiğinde kamerayı yeniden başlat
watch(selectedEventId, () => {
  if (inputMode.value === 'camera' && mediaStream) {
    // Kamera zaten açıksa devam et
  }
});

// Sayfa kapandığında kamerayı kapat
onUnmounted(() => {
  stopCamera();
});

const downloadCertificate = async (memberId: number) => {
  if (!selectedEventId.value) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/certificates/${selectedEventId.value}/${memberId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Sertifika-${memberId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      alert('Sertifika indirilemedi.');
    }
  } catch (error) {
    console.error('Sertifika hatası:', error);
  }
};

const exportAttendance = () => {
  const eventTitle = events.value.find((e) => e.id === selectedEventId.value)?.title || 'etkinlik';
  const rows = attendanceList.value.map((r) => ({
    name: r.member?.name,
    studentId: r.member?.studentId,
    department: r.member?.department,
    email: r.member?.email,
    time: new Date(r.createdAt).toLocaleString('tr-TR'),
  }));
  exportToCsv(
    rows,
    [
      { key: 'name', label: 'Ad Soyad' },
      { key: 'studentId', label: 'Öğrenci No' },
      { key: 'department', label: 'Bölüm' },
      { key: 'email', label: 'E-posta' },
      { key: 'time', label: 'Katılım Zamanı' },
    ],
    `yoklama-${eventTitle}`
  );
};

const fetchAttendance = async () => {
  if (!selectedEventId.value) return;
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/attendance/event/${selectedEventId.value}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      attendanceList.value = await response.json();
    }
  } catch (error) {
    console.error('Yoklama listesi yüklenemedi:', error);
  }
};

const recordAttendance = async () => {
  if (!qrInput.value || !selectedEventId.value) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        eventId: selectedEventId.value,
        qrCode: qrInput.value
      })
    });

    const data = await response.json();

    if (response.ok) {
      lastStatus.value = 'success';
      lastMessage.value = `✅ ${data.member} eklendi.`;
      qrInput.value = '';
      fetchAttendance();
    } else {
      lastStatus.value = 'error';
      lastMessage.value = `❌ ${data.error}`;
    }
  } catch (error) {
    lastStatus.value = 'error';
    lastMessage.value = '❌ Bir hata oluştu.';
  }
  
  // Refocus input for continuous scanning
  nextTick(() => {
    qrInputRef.value?.focus();
  });
};

onMounted(fetchEvents);
</script>
