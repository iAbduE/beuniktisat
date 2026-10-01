<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">🎲 Çekiliş Sistemi</h2>

    <!-- Event Selection -->
    <div class="mb-6">
      <label class="block text-gray-700 text-sm font-bold mb-2">Etkinlik Seçin:</label>
      <select 
        v-model="selectedEventId" 
        @change="onEventChange"
        class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
      >
        <option :value="null">Bir etkinlik seçin...</option>
        <option v-for="event in events" :key="event.id" :value="event.id">
          {{ event.title }} ({{ new Date(event.date).toLocaleDateString('tr-TR') }})
        </option>
      </select>
    </div>

    <div v-if="selectedEventId" class="space-y-6">
      <!-- Event Info -->
      <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-purple-800">{{ selectedEvent?.title }}</h3>
            <p class="text-sm text-purple-600">
              {{ attendanceCount }} katılımcı mevcut
            </p>
          </div>
          <button 
            @click="showNewRaffleForm = !showNewRaffleForm"
            class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-bold"
          >
            ➕ Yeni Çekiliş
          </button>
        </div>
      </div>

      <!-- New Raffle Form -->
      <div v-if="showNewRaffleForm" class="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-bold mb-4 text-gray-800">Yeni Çekiliş Oluştur</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Çekiliş Adı</label>
            <input 
              v-model="newRaffle.title" 
              type="text" 
              placeholder="Örn: iPad Çekilişi" 
              class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">🏆 Kazanan Sayısı</label>
            <input 
              v-model.number="newRaffle.prizeCount" 
              type="number" 
              min="1"
              placeholder="1" 
              class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">📋 Yedek Sayısı</label>
            <input 
              v-model.number="newRaffle.reserveCount" 
              type="number" 
              min="0"
              placeholder="0" 
              class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>
        <div class="mt-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">Açıklama (Opsiyonel)</label>
          <textarea 
            v-model="newRaffle.description" 
            rows="2"
            placeholder="Ödül detayları..." 
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
          ></textarea>
        </div>
        <div class="flex gap-2 mt-4">
          <button 
            @click="createRaffle" 
            :disabled="!newRaffle.title"
            class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold transition-colors"
          >
            ✓ Oluştur
          </button>
          <button 
            @click="showNewRaffleForm = false" 
            class="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 font-bold transition-colors"
          >
            İptal
          </button>
        </div>
      </div>

      <!-- Raffles List -->
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-gray-800 border-b pb-2">Çekilişler</h3>
        
        <div v-if="raffles.length === 0" class="text-center py-8 text-gray-500">
          <span class="text-4xl block mb-2">🎯</span>
          <p>Bu etkinlik için henüz çekiliş yok.</p>
        </div>

        <div 
          v-for="raffle in raffles" 
          :key="raffle.id" 
          class="bg-gradient-to-r border rounded-xl overflow-hidden shadow-sm"
          :class="raffle.status === 'COMPLETED' ? 'from-green-50 to-emerald-50 border-green-200' : 'from-yellow-50 to-amber-50 border-yellow-200'"
        >
          <div class="p-4">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-xl font-bold text-gray-800">{{ raffle.title }}</h4>
                  <span 
                    class="text-xs px-2 py-1 rounded-full font-bold"
                    :class="raffle.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                  >
                    {{ raffle.status === 'COMPLETED' ? '✓ Tamamlandı' : '⏳ Bekliyor' }}
                  </span>
                </div>
                <p v-if="raffle.description" class="text-gray-600 text-sm mt-1">{{ raffle.description }}</p>
                <div class="flex gap-4 text-sm text-gray-500 mt-2">
                  <span>🏆 {{ getMainWinners(raffle).length }} / {{ raffle.prizeCount }} kazanan</span>
                  <span v-if="raffle.reserveCount > 0">📋 {{ getReserves(raffle).length }} / {{ raffle.reserveCount }} yedek</span>
                </div>
              </div>
              
              <div class="flex gap-2">
                <button 
                  v-if="raffle.status !== 'COMPLETED'"
                  @click="drawRaffle(raffle.id)"
                  :disabled="drawing === raffle.id"
                  class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-bold transition-all transform hover:scale-105"
                >
                  <span v-if="drawing === raffle.id" class="animate-spin inline-block">🎰</span>
                  <span v-else>🎲 Çevir!</span>
                </button>
                <button 
                  v-if="(raffle.winners?.length ?? 0) > 0"
                  @click="resetRaffle(raffle.id)"
                  class="bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 font-bold transition-colors"
                  title="Çekilişi Sıfırla"
                >
                  🔄
                </button>
                <button 
                  @click="deleteRaffle(raffle.id)"
                  class="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 font-bold transition-colors"
                  title="Çekilişi Sil"
                >
                  🗑️
                </button>
              </div>
            </div>

            <!-- Winners -->
            <div v-if="(raffle.winners?.length ?? 0) > 0" class="mt-4 pt-4 border-t border-gray-200">
              <!-- Ana Kazananlar -->
              <div v-if="getMainWinners(raffle).length > 0" class="mb-4">
                <h5 class="font-bold text-gray-700 mb-3">🏆 Kazananlar:</h5>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div 
                    v-for="winner in getMainWinners(raffle)" 
                    :key="winner.id"
                    class="bg-white rounded-lg p-3 shadow-sm border flex items-center gap-3"
                    :class="{
                      'border-yellow-400 bg-yellow-50': winner.rank === 1,
                      'border-gray-300 bg-gray-50': winner.rank === 2,
                      'border-orange-300 bg-orange-50': winner.rank === 3
                    }"
                  >
                    <div class="text-2xl font-bold" :class="{
                      'text-yellow-500': winner.rank === 1,
                      'text-gray-400': winner.rank === 2,
                      'text-orange-400': winner.rank === 3,
                      'text-purple-500': winner.rank > 3
                    }">
                      {{ winner.rank === 1 ? '🥇' : winner.rank === 2 ? '🥈' : winner.rank === 3 ? '🥉' : `#${winner.rank}` }}
                    </div>
                    <div>
                      <p class="font-semibold text-gray-800">{{ winner.member?.name }}</p>
                      <p class="text-xs text-gray-500">{{ winner.member?.email }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Yedekler -->
              <div v-if="getReserves(raffle).length > 0">
                <h5 class="font-bold text-gray-600 mb-3">📋 Yedekler:</h5>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div 
                    v-for="winner in getReserves(raffle)" 
                    :key="winner.id"
                    class="rounded-lg p-3 shadow-sm border border-blue-200 bg-blue-50 flex items-center gap-3"
                  >
                    <div class="text-lg font-bold text-blue-500">
                      Y{{ winner.rank - raffle.prizeCount }}
                    </div>
                    <div>
                      <p class="font-semibold text-gray-800">{{ winner.member?.name }}</p>
                      <p class="text-xs text-gray-500">{{ winner.member?.email }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Event Selected -->
    <div v-else class="text-center py-12 text-gray-500">
      <span class="text-6xl block mb-4">🎲</span>
      <p class="text-lg">Çekiliş yapmak için bir etkinlik seçin.</p>
    </div>

    <!-- Winner Animation Modal -->
    <div 
      v-if="showWinnerAnimation" 
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      @click="showWinnerAnimation = false"
    >
      <div class="bg-white rounded-2xl p-8 text-center max-w-md mx-4 transform animate-bounce-slow">
        <div class="text-6xl mb-4">🎉</div>
        <h3 class="text-2xl font-bold text-purple-800 mb-4">Tebrikler!</h3>
        <div class="space-y-2">
          <div 
            v-for="winner in latestWinners" 
            :key="winner.id"
            class="bg-purple-100 rounded-lg p-3"
          >
            <p class="text-xl font-bold text-purple-900">{{ winner.member?.name }}</p>
            <p class="text-sm text-purple-600">{{ winner.rank }}. sırada kazandı!</p>
          </div>
        </div>
        <button 
          @click="showWinnerAnimation = false"
          class="mt-6 bg-purple-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-purple-700"
        >
          Tamam
        </button>
      </div>
    </div>

    <!-- 🎰 HEYECANLI ÇEKİLİŞ MODAL -->
    <Teleport to="body">
      <div 
        v-if="showRaffleModal" 
        class="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999]"
      >
        <div class="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl border-4 border-yellow-400 relative overflow-hidden">
          <!-- Arka plan parıltıları -->
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute -top-20 -left-20 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div class="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 0.5s;"></div>
          </div>

          <!-- Başlık -->
          <div class="text-center mb-8 relative z-10">
            <h2 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 mb-2 animate-pulse">
              🎰 ÇEKİLİŞ ZAMANI! 🎰
            </h2>
            <p class="text-purple-200 text-lg">{{ currentRaffleTitle }}</p>
          </div>

          <!-- Çekiliş henüz başlamadı -->
          <div v-if="raffleState === 'ready'" class="text-center relative z-10">
            <div class="text-8xl mb-6 animate-bounce">🎲</div>
            <p class="text-white text-xl mb-6">{{ participantNames.length }} katılımcı çekilişe hazır!</p>

            <!-- Çekim sırası seçimi - sadece ilk çekimden önce -->
            <div v-if="!currentWinnerName" class="inline-flex bg-black/40 rounded-xl p-1 mb-8 border border-yellow-400/40">
              <button
                @click="drawOrder = 'WINNERS_FIRST'"
                :class="drawOrder === 'WINNERS_FIRST' ? 'bg-yellow-400 text-black' : 'text-yellow-200'"
                class="px-4 py-2 rounded-lg font-bold text-sm transition-all"
              >
                🏆 Önce Kazananlar
              </button>
              <button
                @click="drawOrder = 'RESERVES_FIRST'"
                :class="drawOrder === 'RESERVES_FIRST' ? 'bg-yellow-400 text-black' : 'text-yellow-200'"
                class="px-4 py-2 rounded-lg font-bold text-sm transition-all"
              >
                📋 Önce Yedekler
              </button>
            </div>

            <div>
              <button
                @click="startRaffleAnimation"
                class="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-black font-black text-2xl px-12 py-4 rounded-2xl hover:scale-110 transform transition-all duration-300 shadow-lg hover:shadow-yellow-400/50 animate-pulse"
              >
                🎯 {{ currentWinnerName ? 'SONRAKİ KİŞİYİ ÇEK!' : 'ÇEKİLİŞİ BAŞLAT!' }}
              </button>
            </div>
          </div>

          <!-- İsimler dönüyor -->
          <div v-else-if="raffleState === 'spinning'" class="relative z-10">
            <div class="bg-black/50 rounded-2xl p-6 mb-6 border-2 border-yellow-400/50">
              <!-- Slot Machine Tarzı İsim Döndürme -->
              <div class="relative h-[168px] overflow-hidden">
                <div class="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none"></div>
                <div class="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none"></div>
                <!-- Ortadaki seçim bandı -->
                <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-14 border-y-2 border-yellow-400/40 z-0 pointer-events-none"></div>

                <div
                  class="flex flex-col items-center transition-transform duration-100"
                  :style="{ transform: `translateY(${spinOffset}px)` }"
                >
                  <div
                    v-for="(name, index) in displayNames"
                    :key="index"
                    class="h-14 w-full flex items-center justify-center text-3xl font-bold text-center"
                    :class="index === currentSpinIndex ? 'text-yellow-400 scale-110' : 'text-white/50'"
                  >
                    {{ name }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="text-center">
              <div class="inline-flex items-center gap-2 text-yellow-400 text-xl font-bold">
                <span class="animate-spin">🎰</span>
                <span>Çekiliş yapılıyor...</span>
                <span class="animate-spin">🎰</span>
              </div>
            </div>
          </div>

          <!-- Kazanan açıklandı -->
          <div v-else-if="raffleState === 'winner'" class="text-center relative z-10">
            <!-- Konfeti animasyonu -->
            <div class="absolute inset-0 pointer-events-none overflow-hidden">
              <div v-for="i in 30" :key="i" 
                class="absolute w-3 h-3 animate-confetti"
                :style="{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][i % 7],
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }"
              ></div>
            </div>

            <div class="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 class="text-2xl text-purple-200 mb-4">{{ currentWinnerIsReserve ? 'Ve yedek...' : 'Ve kazanan...' }}</h3>

            <div
              class="rounded-2xl p-6 mb-6 shadow-2xl transform animate-winner-reveal"
              :class="currentWinnerIsReserve ? 'bg-gradient-to-r from-blue-300 via-blue-200 to-blue-300' : 'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400'"
            >
              <div class="text-5xl mb-2">{{ currentWinnerIsReserve ? '📋' : '🏆' }}</div>
              <p class="text-3xl font-black text-purple-900">{{ currentWinnerName }}</p>
              <p class="text-purple-700 font-semibold mt-2">
                {{ currentWinnerIsReserve ? `${currentWinnerRank - currentPrizeCount}. Yedek` : `${currentWinnerRank}. Sıra Kazananı` }}
              </p>
            </div>

            <div class="flex gap-4 justify-center">
              <button 
                v-if="remainingDraws > 0"
                @click="continueRaffle"
                class="bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-lg px-8 py-3 rounded-xl hover:scale-105 transform transition-all"
              >
                🎲 Sonraki Çekilişe Geç ({{ remainingDraws }} kaldı)
              </button>
              <button 
                @click="closeRaffleModal"
                class="bg-gray-600 text-white font-bold text-lg px-8 py-3 rounded-xl hover:bg-gray-700 transition-all"
              >
                ✓ Tamamla
              </button>
            </div>
          </div>

          <!-- Kapat butonu -->
          <button 
            @click="closeRaffleModal"
            class="absolute top-4 right-4 text-white/50 hover:text-white text-2xl z-20"
          >
            ✕
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { API_URL } from '../../config/api';

interface Member {
  id: number;
  name: string;
  email: string;
}

interface RaffleWinner {
  id: number;
  raffleId: number;
  memberId: number;
  member?: Member;
  rank: number;
  isReserve: boolean;
  createdAt: string;
}

interface Raffle {
  id: number;
  eventId: number;
  title: string;
  description?: string;
  prizeCount: number;
  reserveCount: number;
  status: string;
  winners?: RaffleWinner[];
  createdAt: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
}

interface Participant {
  id: number;
  name: string;
  email: string;
}

const events = ref<Event[]>([]);
const selectedEventId = ref<number | null>(null);
const attendanceCount = ref(0);
const raffles = ref<Raffle[]>([]);
const showNewRaffleForm = ref(false);
const drawing = ref<number | null>(null);
const showWinnerAnimation = ref(false);
const latestWinners = ref<RaffleWinner[]>([]);

// 🎰 Yeni çekiliş animasyon state'leri
const showRaffleModal = ref(false);
const raffleState = ref<'ready' | 'spinning' | 'winner'>('ready');
const participantNames = ref<string[]>([]);
const displayNames = ref<string[]>([]);
const currentSpinIndex = ref(0);
const spinOffset = ref(0);
const currentWinnerName = ref('');
const currentWinnerRank = ref(0);
const currentWinnerIsReserve = ref(false);
const currentRaffleId = ref<number | null>(null);
const currentRaffleTitle = ref('');
const currentPrizeCount = ref(0);
const remainingDraws = ref(0);
const allParticipants = ref<Participant[]>([]);
// Çekim sırası: önce ana kazananlar mı, önce yedekler mi
const drawOrder = ref<'WINNERS_FIRST' | 'RESERVES_FIRST'>('WINNERS_FIRST');

const newRaffle = ref({
  title: '',
  description: '',
  prizeCount: 1,
  reserveCount: 0
});

const selectedEvent = computed(() => 
  events.value.find(e => e.id === selectedEventId.value)
);

// Helper functions for winners
const getMainWinners = (raffle: Raffle) => {
  return (raffle.winners || []).filter(w => !w.isReserve);
};

const getReserves = (raffle: Raffle) => {
  return (raffle.winners || []).filter(w => w.isReserve);
};

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

const onEventChange = async () => {
  if (!selectedEventId.value) {
    raffles.value = [];
    attendanceCount.value = 0;
    return;
  }
  
  await Promise.all([fetchRaffles(), fetchAttendanceCount()]);
};

const fetchRaffles = async () => {
  if (!selectedEventId.value) return;
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/raffles/event/${selectedEventId.value}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      raffles.value = await response.json();
    }
  } catch (error) {
    console.error('Çekilişler yüklenemedi:', error);
  }
};

const fetchAttendanceCount = async () => {
  if (!selectedEventId.value) return;
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/attendance/event/${selectedEventId.value}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      attendanceCount.value = data.length;
    }
  } catch (error) {
    console.error('Katılımcı sayısı alınamadı:', error);
  }
};

const createRaffle = async () => {
  if (!newRaffle.value.title || !selectedEventId.value) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/raffles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        eventId: selectedEventId.value,
        ...newRaffle.value
      })
    });

    if (response.ok) {
      newRaffle.value = { title: '', description: '', prizeCount: 1, reserveCount: 0 };
      showNewRaffleForm.value = false;
      fetchRaffles();
    } else {
      const data = await response.json();
      alert(data.error || 'Çekiliş oluşturulamadı.');
    }
  } catch (error) {
    console.error('Çekiliş oluşturma hatası:', error);
    alert('Bir hata oluştu.');
  }
};

const drawRaffle = async (raffleId: number) => {
  // Önce katılımcıları al ve modal'ı aç
  const raffle = raffles.value.find(r => r.id === raffleId);
  if (!raffle) return;

  currentRaffleId.value = raffleId;
  currentRaffleTitle.value = raffle.title;
  currentPrizeCount.value = raffle.prizeCount;
  currentWinnerName.value = '';
  currentWinnerIsReserve.value = false;

  // Katılımcıları getir
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/attendance/event/${selectedEventId.value}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const attendances = await response.json();
      
      // Daha önce kazanmış olanları çıkar
      const previousWinnerIds = (raffle.winners || []).map(w => w.memberId);
      const eligible = attendances.filter((a: any) => !previousWinnerIds.includes(a.memberId));
      
      allParticipants.value = eligible.map((a: any) => ({
        id: a.memberId,
        name: a.member?.name || 'İsimsiz',
        email: a.member?.email || ''
      }));
      
      participantNames.value = allParticipants.value.map(p => p.name);
      
      // İsimleri karıştır ve çoğalt (dönerken görünecek)
      const shuffled = [...participantNames.value].sort(() => Math.random() - 0.5);
      displayNames.value = [...shuffled, ...shuffled, ...shuffled]; // 3 kat çoğalt
      
      // Kalan çekiliş sayısını hesapla
      const totalSlots = raffle.prizeCount + raffle.reserveCount;
      const filledSlots = (raffle.winners || []).length;
      remainingDraws.value = Math.min(totalSlots - filledSlots, eligible.length);
      
      if (eligible.length === 0) {
        alert('Çekilişe katılabilecek kişi kalmadı!');
        return;
      }
      
      // Modal'ı aç
      raffleState.value = 'ready';
      showRaffleModal.value = true;
    }
  } catch (error) {
    console.error('Katılımcılar alınamadı:', error);
    alert('Katılımcılar yüklenemedi.');
  }
};

// Çekiliş: önce sunucudan kazananı al, sonra makarayı TAM o ismin üstünde durdur.
// Böylece ekranda duran isim = gerçek kazanan olur.
const startRaffleAnimation = async () => {
  raffleState.value = 'spinning';
  currentSpinIndex.value = 0;
  // Pencere 3 satır (168px); seçili isim ortadaki banda oturur: 56 - index*56
  spinOffset.value = 56;

  // 1) Kazananı sunucudan al (adil, sunucu-taraflı seçim)
  let winner;
  let remainingSlots;
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/raffles/${currentRaffleId.value}/draw`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      // Her çağrıda TEK kişi çek + seçilen sıraya göre
      body: JSON.stringify({ count: 1, order: drawOrder.value })
    });

    const data = await response.json();

    if (!response.ok || !data.winners || data.winners.length === 0) {
      alert(data.error || 'Çekiliş yapılamadı.');
      closeRaffleModal();
      return;
    }

    winner = data.winners[0];
    remainingSlots = data.remainingSlots;
  } catch (error) {
    console.error('Çekiliş hatası:', error);
    alert('Bir hata oluştu.');
    closeRaffleModal();
    return;
  }

  const winnerName = winner.member?.name || 'Kazanan';

  // 2) Makara listesini kur: bir sürü rastgele isim + EN SONDA kazanan
  const pool = participantNames.value.length > 0 ? participantNames.value : [winnerName];
  const spinCount = Math.max(35, pool.length * 2);
  const reel = [];
  for (let i = 0; i < spinCount; i++) {
    reel.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  reel.push(winnerName); // makara bunun üstünde duracak
  displayNames.value = reel;
  const targetIndex = reel.length - 1;

  // 3) Animasyon: hızlı başla, yavaşlayarak targetIndex'te dur
  let step = 0;
  const baseDelay = 40;   // başlangıç hızı (ms)
  const maxDelay = 340;   // bitişteki yavaşlık

  const tick = () => {
    currentSpinIndex.value = step;
    // Seçili ismi ortadaki banda hizala (her isim tam 56px)
    spinOffset.value = 56 - step * 56;

    if (step >= targetIndex) {
      // Makara kazananın üstünde durdu. Kısa bir an göster, sonra açıkla.
      setTimeout(() => revealWinner(winner, remainingSlots), 900);
      return;
    }

    // Son %30'da kademeli yavaşla (easing)
    const progress = step / targetIndex;
    const delay = progress > 0.7
      ? baseDelay + ((progress - 0.7) / 0.3) * (maxDelay - baseDelay)
      : baseDelay;

    step++;
    setTimeout(tick, delay);
  };

  tick();
};

// Ekranda duran ismi kazanan olarak göster
const revealWinner = (winner: RaffleWinner, remainingSlots?: number) => {
  currentWinnerName.value = winner.member?.name || 'Kazanan';
  currentWinnerRank.value = winner.rank;
  currentWinnerIsReserve.value = winner.isReserve;

  raffleState.value = 'winner';
  // Kalan çekim sayısını backend'den senkronize et
  remainingDraws.value = remainingSlots ?? (remainingDraws.value - 1);

  // Seçilen kişiyi havuzdan çıkar (bir sonraki çekim için)
  participantNames.value = participantNames.value.filter(n => n !== currentWinnerName.value);

  // Rafları güncelle
  fetchRaffles();
};

// Sonraki çekilişe devam et
const continueRaffle = () => {
  if (participantNames.value.length === 0) {
    alert('Çekilişe katılabilecek kişi kalmadı!');
    closeRaffleModal();
    return;
  }
  raffleState.value = 'ready';
};

// Modal'ı kapat
const closeRaffleModal = () => {
  showRaffleModal.value = false;
  raffleState.value = 'ready';
  currentRaffleId.value = null;
  currentWinnerName.value = '';
  currentWinnerIsReserve.value = false;
  fetchRaffles();
};

const resetRaffle = async (raffleId: number) => {
  if (!confirm('Çekilişi sıfırlamak istediğinize emin misiniz? Tüm kazananlar silinecek.')) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/raffles/${raffleId}/reset`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      fetchRaffles();
    } else {
      const data = await response.json();
      alert(data.error || 'Çekiliş sıfırlanamadı.');
    }
  } catch (error) {
    console.error('Sıfırlama hatası:', error);
    alert('Bir hata oluştu.');
  }
};

const deleteRaffle = async (raffleId: number) => {
  if (!confirm('Bu çekilişi silmek istediğinize emin misiniz?')) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/raffles/${raffleId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      fetchRaffles();
    } else {
      const data = await response.json();
      alert(data.error || 'Çekiliş silinemedi.');
    }
  } catch (error) {
    console.error('Silme hatası:', error);
    alert('Bir hata oluştu.');
  }
};

onMounted(fetchEvents);
</script>

<style scoped>
@keyframes bounce-slow {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 0.5s ease-in-out;
}

/* Konfeti animasyonu */
@keyframes confetti {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.animate-confetti {
  animation: confetti 3s ease-in-out infinite;
}

/* Kazanan reveal animasyonu */
@keyframes winner-reveal {
  0% {
    transform: scale(0) rotate(-10deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.animate-winner-reveal {
  animation: winner-reveal 0.6s ease-out forwards;
}

/* Parıltı efekti */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Slot machine efekti için smooth geçiş */
.slot-name {
  transition: all 0.1s linear;
}
</style>
