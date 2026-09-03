import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '../layouts/DashboardLayout.vue'

const routes = [
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

export default router
