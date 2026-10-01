<template>
  <div class="flex h-screen bg-slate-100 font-sans">
    <!-- Mobil overlay -->
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 bg-black/50 z-30 lg:hidden"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
      class="fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 shadow-2xl"
    >
      <div class="p-6 border-b border-slate-800">
        <h1 class="text-xl font-bold text-white flex items-center gap-2">
          <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-extrabold shadow-lg">B</span>
          Admin Paneli
        </h1>
        <p class="text-xs text-slate-500 mt-2">BEÜ İktisat Topluluğu</p>
      </div>

      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <template v-for="item in navItems" :key="item.key">
          <p v-if="item.section" class="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            {{ item.section }}
          </p>
          <button
            v-else
            @click="selectView(item.key!)"
            :class="currentView === item.key
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/40'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          >
            <span class="text-base w-5 text-center">{{ item.icon }}</span>
            {{ item.label }}
          </button>
        </template>
      </nav>

      <div class="p-4 border-t border-slate-800">
        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white font-semibold py-2.5 px-4 rounded-xl transition-colors duration-200 text-sm"
        >
          <span>⏻</span> Çıkış Yap
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <header class="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center gap-4 shadow-sm">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          aria-label="Menüyü aç/kapat"
        >
          ☰
        </button>
        <h2 class="text-xl lg:text-2xl font-bold text-slate-800 flex-1 truncate">
          {{ viewTitles[currentView] || 'Genel Bakış' }}
        </h2>
        <a
          href="/"
          target="_blank"
          class="hidden sm:flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium"
        >
          🌐 Siteyi Görüntüle ↗
        </a>
      </header>

      <div class="flex-1 p-4 lg:p-8 overflow-y-auto">
        <!-- Dashboard View -->
        <div v-if="currentView === 'dashboard'" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <span class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">👆</span>
              <div>
                <p class="text-sm text-slate-500 font-medium">Toplam Tıklanma</p>
                <p class="text-3xl font-bold text-blue-600">{{ totalClicks }}</p>
              </div>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <span class="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl">🔗</span>
              <div>
                <p class="text-sm text-slate-500 font-medium">Aktif Linkler</p>
                <p class="text-3xl font-bold text-green-600">{{ activeLinksCount }}</p>
              </div>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <span class="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl">📅</span>
              <div>
                <p class="text-sm text-slate-500 font-medium">Yaklaşan Etkinlikler</p>
                <p class="text-3xl font-bold text-purple-600">{{ upcomingEventsCount }}</p>
              </div>
            </div>
          </div>

          <!-- Analytics Chart -->
          <AnalyticsChart />
        </div>

        <LinkManager v-if="currentView === 'links'" />
        <EventManager v-if="currentView === 'events'" />
        <SponsorManager v-if="currentView === 'sponsors'" />
        <AnnouncementManager v-if="currentView === 'announcements'" />
        <VideoManager v-if="currentView === 'videos'" />
        <SocialPostManager v-if="currentView === 'social'" />
        <MemberManager v-if="currentView === 'members'" />
        <AttendanceManager v-if="currentView === 'attendance'" />
        <RaffleManager v-if="currentView === 'raffle'" />
        <QrTrackManager v-if="currentView === 'qrtrack'" />
        <SettingsManager v-if="currentView === 'settings'" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LinkManager from './admin/LinkManager.vue';
import EventManager from './admin/EventManager.vue';
import SponsorManager from './admin/SponsorManager.vue';
import AnnouncementManager from './admin/AnnouncementManager.vue';
import VideoManager from './admin/VideoManager.vue';
import SocialPostManager from './admin/SocialPostManager.vue';
import MemberManager from './admin/MemberManager.vue';
import AttendanceManager from './admin/AttendanceManager.vue';
import RaffleManager from './admin/RaffleManager.vue';
import QrTrackManager from './admin/QrTrackManager.vue';
import SettingsManager from './admin/SettingsManager.vue';
import AnalyticsChart from '../components/AnalyticsChart.vue';
import { API_URL } from '../config/api';

interface NavItem {
  key?: string;
  label?: string;
  icon?: string;
  section?: string;
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Genel Bakış', icon: '📊' },
  { section: 'İçerik' },
  { key: 'links', label: 'Linkler', icon: '🔗' },
  { key: 'events', label: 'Etkinlikler', icon: '📅' },
  { key: 'announcements', label: 'Duyurular', icon: '📢' },
  { key: 'videos', label: 'Video Galeri', icon: '🎬' },
  { key: 'social', label: 'Sosyal Medya', icon: '📸' },
  { key: 'sponsors', label: 'Sponsorlar', icon: '🤝' },
  { section: 'Topluluk' },
  { key: 'members', label: 'Üyeler', icon: '👥' },
  { key: 'attendance', label: 'Yoklama', icon: '✅' },
  { key: 'raffle', label: 'Çekiliş', icon: '🎲' },
  { section: 'Sistem' },
  { key: 'qrtrack', label: 'QR Takip', icon: '📱' },
  { key: 'settings', label: 'Site Ayarları', icon: '⚙️' },
];

const viewTitles: Record<string, string> = {
  dashboard: 'Genel Bakış',
  links: 'Link Yönetimi',
  events: 'Etkinlik Yönetimi',
  sponsors: 'Sponsor Yönetimi',
  announcements: 'Duyuru Yönetimi',
  videos: 'Video Galeri Yönetimi',
  social: 'Sosyal Medya Yönetimi',
  members: 'Üye Yönetimi',
  attendance: 'Yoklama Sistemi',
  raffle: 'Çekiliş Yönetimi',
  qrtrack: 'QR Takip',
  settings: 'Site Ayarları',
};

const router = useRouter();
const authStore = useAuthStore();
const currentView = ref('dashboard');
const sidebarOpen = ref(false);
const links = ref<any[]>([]);
const events = ref<any[]>([]);

const selectView = (view: string) => {
  currentView.value = view;
  sidebarOpen.value = false; // Mobilde seçim sonrası menüyü kapat
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const fetchStats = async () => {
  try {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    const [linksRes, eventsRes] = await Promise.all([
      fetch(`${API_URL}/links`, { headers }),
      fetch(`${API_URL}/events`, { headers }),
    ]);
    if (linksRes.ok) links.value = await linksRes.json();
    if (eventsRes.ok) events.value = await eventsRes.json();
  } catch (error) {
    console.error('İstatistikler yüklenemedi:', error);
  }
};

const totalClicks = computed(() =>
  links.value.reduce((sum, link) => sum + (link.clicks || 0), 0)
);

const activeLinksCount = computed(() =>
  links.value.filter(link => link.isActive).length
);

const upcomingEventsCount = computed(() =>
  events.value.filter(e => e.isActive && new Date(e.date) >= new Date()).length
);

onMounted(() => {
  fetchStats();
});
</script>
