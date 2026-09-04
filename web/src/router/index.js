import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '../layouts/DashboardLayout.vue'

const routes = [
  // ========== LOGIN PEMILIK ==========
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: { title: 'Login', public: true }
  },

  // ========== DASHBOARD PEMILIK ==========
  {
    path: '/',
    component: DashboardLayout,
    children: [
      { path: '', name: 'dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: 'Dashboard' } },
      { path: 'kamar', name: 'kamar', component: () => import('../views/Kamar.vue'), meta: { title: 'Kamar' } },
      { path: 'penghuni', name: 'penghuni', component: () => import('../views/Penghuni.vue'), meta: { title: 'Penghuni' } },
      { path: 'pembayaran', name: 'pembayaran', component: () => import('../views/Pembayaran.vue'), meta: { title: 'Pembayaran' } },
      { path: 'tagihan/listrik', name: 'tagihan-listrik', component: () => import('../views/TagihanListrik.vue'), meta: { title: 'Tagihan Listrik' } },
      { path: 'tagihan/air', name: 'tagihan-air', component: () => import('../views/TagihanAir.vue'), meta: { title: 'Tagihan Air' } },
      { path: 'tagihan/internet', name: 'tagihan-internet', component: () => import('../views/TagihanInternet.vue'), meta: { title: 'Tagihan Internet' } },
      { path: 'pengeluaran', name: 'pengeluaran', component: () => import('../views/Pengeluaran.vue'), meta: { title: 'Pengeluaran' } },
      { path: 'maintenance', name: 'maintenance', component: () => import('../views/Maintenance.vue'), meta: { title: 'Maintenance' } },
      { path: 'laporan', name: 'laporan', component: () => import('../views/Laporan.vue'), meta: { title: 'Laporan' } },
      { path: 'pengaturan', name: 'pengaturan', component: () => import('../views/Pengaturan.vue'), meta: { title: 'Pengaturan' } }
    ],
    meta: { requiresPemilik: true }
  },

  // ========== PORTAL PENGHUNI ==========
  {
    path: '/penghuni',
    component: () => import('../layouts/PenghuniLayout.vue'),
    meta: { requiresPenghuni: true },
    children: [
      {
        path: 'dashboard',
        name: 'penghuni-dashboard',
        component: () => import('../views/penghuni/DashboardPenghuni.vue'),
        meta: { title: 'Dashboard Penghuni' }
      },
      {
        path: 'tagihan',
        name: 'penghuni-tagihan',
        component: () => import('../views/penghuni/TagihanPenghuni.vue'),
        meta: { title: 'Tagihan Saya' }
      },
      {
        path: 'lapor',
        name: 'penghuni-lapor',
        component: () => import('../views/penghuni/LaporMasalah.vue'),
        meta: { title: 'Lapor Masalah' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const isPemilikLoggedIn = !!localStorage.getItem('kos_user')
  const isPenghuniLoggedIn = !!localStorage.getItem('penghuni_token')

  // Halaman public (login)
  if (to.meta.public) {
    // Kalau sudah login pemilik & buka /login → redirect ke dashboard pemilik
    if (to.path === '/login' && isPemilikLoggedIn) {
      return next('/')
    }
    return next()
  }

  // Route khusus portal penghuni
  if (to.matched.some((record) => record.meta.requiresPenghuni)) {
    if (!isPenghuniLoggedIn) {
      return next('/login')
    }
    return next()
  }

  // Route pemilik (default)
  if (!isPemilikLoggedIn) {
    return next('/login')
  }

  next()
})

export default router