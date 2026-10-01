<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-xl font-bold text-gray-700 mb-4">Son 7 Günlük Tıklanma</h3>
    <div class="h-64">
      <Bar v-if="loaded" :data="chartData" :options="chartOptions" />
      <div v-else class="flex items-center justify-center h-full text-gray-500">
        Yükleniyor...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { API_URL } from '../config/api';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const loaded = ref(false);
const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Tıklanma Sayısı',
      backgroundColor: '#3B82F6',
      data: []
    }
  ]
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};

const fetchAnalytics = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/links/analytics`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      chartData.value = {
        labels: data.map((d: any) => d.date),
        datasets: [
          {
            label: 'Tıklanma Sayısı',
            backgroundColor: '#3B82F6',
            data: data.map((d: any) => d.count)
          }
        ]
      };
      loaded.value = true;
    }
  } catch (error) {
    console.error('Analitik verisi alınamadı:', error);
  }
};

onMounted(() => {
  fetchAnalytics();
});
</script>
