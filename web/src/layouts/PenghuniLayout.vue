<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const penghuni = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('penghuni_data') || '{}')
  } catch {
    return {}
  }
})

const menu = [
  { path: '/penghuni/dashboard', label: 'Dashboard', icon: 'home' },
  { path: '/penghuni/tagihan', label: 'Tagihan', icon: 'bill' },
  { path: '/penghuni/lapor', label: 'Lapor Masalah', icon: 'wrench' }
]

function logout() {
  localStorage.removeItem('penghuni_token')
  localStorage.removeItem('penghuni_data')
  router.push('/penghuni/login')
}

function isActive(path) {
  return route.path === path
}
</script>

<template>
  <div class="min-h-screen bg-ink-50 flex">
    <!-- Sidebar -->
    <aside class="w-56 bg-ink-900 text-white flex flex-col shrink-0">
      <div class="p-5 border-b border-white/10">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-sm">K</div>
          <div>
            <p class="text-[13px] font-semibold">KelolaKos</p>
            <p class="text-[11px] text-white/60">Portal Penghuni</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 p-3 space-y-1">
        <router-link
          v-for="item in menu"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] transition"
          :class="isActive(item.path) ? 'bg-brand-500 text-white' : 'text-white/70 hover:bg-white/10'"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="p-4 border-t border-white/10">
        <p class="text-[12px] text-white/60 mb-1">Halo,</p>
        <p class="text-[13.5px] font-medium truncate">{{ penghuni.nama || 'Penghuni' }}</p>
        <p class="text-[12px] text-white/50">Kamar {{ penghuni.nomor_kamar }}</p>
        <button
          type="button"
          class="mt-3 w-full text-left text-[13px] text-red-300 hover:text-red-200"
          @click="logout"
        >
          Keluar
        </button>
      </div>
    </aside>

    <!-- Content -->
    <main class="flex-1 p-5 lg:p-6 overflow-auto">
      <router-view />
    </main>
  </div>
</template>