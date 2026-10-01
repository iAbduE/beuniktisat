import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminDashboard.vue'), // Lazy load
    meta: { requiresAuth: true },
  },
  {
    path: '/card/:qrCode',
    name: 'DigitalCard',
    component: () => import('../views/DigitalCard.vue'),
  },
  {
    path: '/register/:formCode',
    name: 'EventRegistration',
    component: () => import('../views/EventRegistration.vue'),
  },
  {
    path: '/belgelerim',
    name: 'StudentPortal',
    component: () => import('../views/StudentPortal.vue'),
  },
  {
    path: '/dogrula/:code',
    name: 'CertificateVerify',
    component: () => import('../views/CertificateVerify.vue'),
  },
  {
    path: '/qr-sayfasi/:shortCode',
    name: 'QrPage',
    component: () => import('../views/QrPage.vue'),
  },
  {
    path: '/katilim/:projectionCode',
    name: 'AttendanceScreen',
    component: () => import('../views/AttendanceScreen.vue'), // Projeksiyon için hareketli QR
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if (to.meta.requiresAdmin && !isAdminToken(token)) {
    next('/login');
  } else {
    next();
  }
});

const isAdminToken = (token: string | null) => {
  if (!token) return false;
  try {
    const payload = token.split('.')[1];
    if (!payload) return false;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
    return JSON.parse(decoded).role === 'ADMIN';
  } catch {
    return false;
  }
};

export default router;

