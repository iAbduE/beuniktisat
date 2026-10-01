<template>
  <div class="relative min-h-screen">
    <!-- WebGL Silk arka plan (varsayılan) -->
    <div v-if="useAnimatedBackground" class="fixed inset-0">
      <SilkShader
        :time-scale="0.61"
        :brightness="0"
        :blur="0"
        cursor-enabled
        :cursor-effect="2"
        :cursor-strength="1"
        :cursor-radius="0.20"
      />
    </div>
    <!-- Admin panelden seçilen düz renk / görsel arka plan -->
    <div v-else class="fixed inset-0" :style="backgroundStyle"></div>

    <div class="relative z-10 flex flex-col items-center py-10 px-4 min-h-screen">
    <!-- Profile Section -->
    <div class="text-center mb-8 animate-fade-in">
      <div class="relative w-28 h-28 mx-auto mb-5">
        <div class="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500 opacity-80 blur-sm animate-spin-slow"></div>
        <div class="relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/40 overflow-hidden bg-white/10 backdrop-blur-sm">
          <img
            v-if="settings.profileImage"
            :src="settings.profileImage"
            alt="Profile"
            class="w-full h-full object-cover"
          />
          <span v-else class="text-4xl font-bold text-white">BEÜ</span>
        </div>
      </div>
      <h1 class="text-3xl font-extrabold text-white tracking-wide drop-shadow-lg">
        {{ settings.profileTitle || 'BEÜ İktisat Topluluğu' }}
      </h1>
      <p class="text-white/70 mt-2 text-sm tracking-wide">
        {{ settings.profileSubtitle || 'Ekonomi, Finans ve Gelecek' }}
      </p>
    </div>

    <!-- Announcements Section -->
    <div v-if="announcements.length > 0" class="w-full max-w-lg mb-6 animate-slide-up">
      <div class="bg-yellow-400/90 backdrop-blur-sm text-yellow-900 p-4 rounded-2xl shadow-lg" role="alert">
        <p class="font-bold text-sm mb-1">📢 Duyuru</p>
        <p v-for="announcement in announcements" :key="announcement.id" class="text-sm">
          {{ announcement.content }}
        </p>
      </div>
    </div>

    <!-- Links Section -->
    <div class="w-full max-w-lg space-y-3">
      <a
        v-for="(link, index) in links"
        :key="link.id"
        :href="link.url"
        target="_blank"
        @click="trackClick(link.id)"
        class="link-button group"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <span class="shine"></span>
        <div class="relative flex items-center gap-3 px-2">
          <span class="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
            <img
              v-if="link.iconUrl"
              :src="getImageUrl(link.iconUrl)"
              :alt="link.title"
              class="w-6 h-6 object-contain"
            />
            <span v-else-if="link.icon" class="text-xl">{{ link.icon }}</span>
            <span v-else class="text-blue-600 font-bold">→</span>
          </span>
          <span class="flex-1 text-center font-semibold text-base transition-transform duration-300 group-hover:scale-[1.03]">
            {{ link.title }}
          </span>
          <span class="w-9 shrink-0 text-blue-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-center">
            ↗
          </span>
        </div>
      </a>
    </div>

    <!-- Öğrenci Portalı CTA -->
    <router-link
      to="/belgelerim"
      class="group w-full max-w-lg mt-4 flex items-center gap-4 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20 hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-1 transition-all duration-300"
    >
      <span class="w-11 h-11 shrink-0 rounded-xl bg-white/20 flex items-center justify-center text-2xl">🎓</span>
      <div class="flex-1 text-left">
        <p class="font-bold text-white">Öğrenci Portalı</p>
        <p class="text-white/70 text-xs">Dijital kartın ve sertifikaların — giriş yok</p>
      </div>
      <span class="text-white/80 group-hover:translate-x-1 transition-transform">→</span>
    </router-link>

    <!-- Events Section -->
    <div v-if="events.length > 0" class="w-full max-w-lg mt-10 animate-slide-up">
      <h2 class="text-white text-lg font-bold mb-4 text-center flex items-center justify-center gap-2">
        <span>📅</span> Yaklaşan Etkinlikler
      </h2>
      <div class="space-y-4">
        <div 
          v-for="event in events" 
          :key="event.id"
          class="bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow"
        >
          <img 
            v-if="event.imageUrl" 
            :src="getImageUrl(event.imageUrl)" 
            alt="Event Cover" 
            class="w-full h-auto object-contain"
          />
          <div class="p-4">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-lg font-bold text-gray-800">{{ event.title }}</h3>
              <span class="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                {{ new Date(event.date).toLocaleDateString('tr-TR') }}
              </span>
            </div>
            <p class="text-gray-600 text-sm mb-2">{{ event.description }}</p>
            <div class="flex items-center text-gray-500 text-xs">
              <span>📍 {{ event.location }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sponsors Section -->
    <div v-if="sponsors.length > 0" class="w-full max-w-lg mt-12">
      <h2 class="text-white/60 text-xs font-semibold mb-4 text-center uppercase tracking-widest">
        Sponsorlarımız
      </h2>
      <div class="flex flex-wrap justify-center gap-4">
        <a 
          v-for="sponsor in sponsors" 
          :key="sponsor.id" 
          :href="sponsor.redirectUrl || '#'" 
          target="_blank"
          class="bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg hover:scale-110 transition-transform duration-300"
        >
          <img :src="getImageUrl(sponsor.imageUrl)" :alt="sponsor.name" class="h-10 max-w-20 object-contain" />
        </a>
      </div>
    </div>

    <!-- Video Gallery Section -->
    <div v-if="videos.length > 0" class="w-full max-w-lg mt-12">
      <h2 class="text-white text-lg font-bold mb-4 text-center flex items-center justify-center gap-2">
        <span>🎬</span> Video Galeri
      </h2>
      <div class="space-y-4">
        <div v-for="video in videos" :key="video.id" class="rounded-2xl overflow-hidden shadow-xl">
          <iframe 
            :src="getEmbedUrl(video.url)" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            class="w-full h-56"
          ></iframe>
        </div>
      </div>
    </div>

    <!-- Social Media Posts Section -->
    <div v-if="socialPosts.length > 0" class="w-full max-w-lg mt-12">
      <h2 class="text-white text-lg font-bold mb-4 text-center flex items-center justify-center gap-2">
        <span>📸</span> Sosyal Medya
      </h2>
      <div class="space-y-4">
        <div v-for="post in socialPosts" :key="post.id" class="bg-white rounded-2xl p-4 shadow-xl">
          <div v-if="post.platform === 'INSTAGRAM'" class="flex justify-center">
             <blockquote 
              class="instagram-media" 
              :data-instgrm-permalink="post.url" 
              data-instgrm-version="14"
              style="background:#FFF; border:0; border-radius:12px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%;"
            ></blockquote>
          </div>
          <div v-else class="text-center">
            <a :href="post.url" target="_blank" class="text-blue-500 hover:underline">
              {{ post.url }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="mt-12 flex justify-center">
      <PoweredByAbdusselam />
    </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import API_BASE_URL, { API_URL } from '../config/api';
import SilkShader from '../components/SilkShader.vue';
import PoweredByAbdusselam from '../components/PoweredByAbdusselam.vue';

interface SiteSettings {
  backgroundType: string;
  backgroundColor: string | null;
  backgroundGradient: string | null;
  backgroundImage: string | null;
  profileImage: string | null;
  profileTitle: string | null;
  profileSubtitle: string | null;
}

const links = ref<any[]>([]);
const events = ref<any[]>([]);
const sponsors = ref<any[]>([]);
const announcements = ref<any[]>([]);
const videos = ref<any[]>([]);
const socialPosts = ref<any[]>([]);
const settings = ref<SiteSettings>({
  backgroundType: 'gradient',
  backgroundColor: '#1e3a8a',
  backgroundGradient: 'from-blue-900 to-gray-900',
  backgroundImage: null,
  profileImage: null,
  profileTitle: 'BEÜ İktisat Topluluğu',
  profileSubtitle: 'Ekonomi, Finans ve Gelecek'
});

// Admin panelden özel arka plan seçilmediyse hareketli shader kullanılır
const useAnimatedBackground = computed(() => {
  const s = settings.value;
  if (s.backgroundType === 'image' && s.backgroundImage) return false;
  if (s.backgroundType === 'solid' && s.backgroundColor) return false;
  return true;
});

const backgroundStyle = computed(() => {
  if (settings.value.backgroundType === 'image' && settings.value.backgroundImage) {
    return {
      backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${settings.value.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    };
  } else if (settings.value.backgroundType === 'solid' && settings.value.backgroundColor) {
    return {
      backgroundColor: settings.value.backgroundColor
    };
  } else {
    // Default gradient
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
    console.error("Ayarlar yüklenemedi:", error);
  }
};

const fetchLinks = async () => {
  try {
    const response = await fetch(`${API_URL}/links?publicView=true`);
    links.value = await response.json();
  } catch (error) {
    console.error("Linkler yüklenemedi:", error);
  }
};

const fetchEvents = async () => {
  try {
    const response = await fetch(`${API_URL}/events?publicView=true`);
    events.value = await response.json();
  } catch (error) {
    console.error("Etkinlikler yüklenemedi:", error);
  }
};

const fetchSponsors = async () => {
  try {
    const response = await fetch(`${API_URL}/sponsors?publicView=true`);
    sponsors.value = await response.json();
  } catch (error) {
    console.error("Sponsorlar yüklenemedi:", error);
  }
};

const fetchAnnouncements = async () => {
  try {
    const response = await fetch(`${API_URL}/announcements?publicView=true`);
    announcements.value = await response.json();
  } catch (error) {
    console.error("Duyurular yüklenemedi:", error);
  }
};

const fetchVideos = async () => {
  try {
    const response = await fetch(`${API_URL}/videos?publicView=true`);
    videos.value = await response.json();
  } catch (error) {
    console.error("Videolar yüklenemedi:", error);
  }
};

const fetchSocialPosts = async () => {
  try {
    const response = await fetch(`${API_URL}/social-posts?publicView=true`);
    socialPosts.value = await response.json();
    setTimeout(() => {
      if ((window as any).instgrm) {
        (window as any).instgrm.Embeds.process();
      }
    }, 1000);
  } catch (error) {
    console.error("Sosyal medya gönderileri yüklenemedi:", error);
  }
};

const getEmbedUrl = (url: string) => {
  let videoId = '';
  if (url.includes('youtube.com/watch?v=')) {
    const parts = url.split('v=');
    if (parts.length > 1) {
      videoId = parts[1]?.split('&')[0] || '';
    }
  } else if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/');
    if (parts.length > 1) {
      videoId = parts[1] || '';
    }
  }
  return `https://www.youtube.com/embed/${videoId}`;
};

const getImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('/uploads/')) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
};

const trackClick = async (id: number) => {
  try {
    await fetch(`${API_URL}/links/${id}/click`, {
      method: "POST",
    });
  } catch (error) {
    console.error("Tıklanma kaydedilemedi:", error);
  }
};

onMounted(() => {
  fetchSettings();
  fetchLinks();
  fetchEvents();
  fetchSponsors();
  fetchAnnouncements();
  fetchVideos();
          fetchSocialPosts();

  const script = document.createElement('script');
  script.async = true;
  script.src = '//www.instagram.com/embed.js';
  document.body.appendChild(script);
});
</script>

<style scoped>
.link-button {
  @apply relative block w-full bg-white/95 backdrop-blur-md rounded-2xl p-4
         text-gray-800 shadow-lg border border-white/50 overflow-hidden
         transition-all duration-300 ease-out
         hover:bg-white hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/25
         active:scale-[0.98] active:translate-y-0;
  animation: slideUp 0.5s ease-out forwards;
  opacity: 0;
}

/* Hover'da soldan sağa geçen parıltı (shine) efekti */
.link-button .shine {
  position: absolute;
  top: 0;
  left: -75%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(99, 102, 241, 0.15),
    transparent
  );
  transform: skewX(-20deg);
  transition: left 0.7s ease;
  pointer-events: none;
}

.link-button:hover .shine {
  left: 130%;
}

.animate-spin-slow {
  animation: spinSlow 8s linear infinite;
}

@keyframes spinSlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .animate-spin-slow {
    animation: none;
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

.animate-slide-up {
  animation: slideUp 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
