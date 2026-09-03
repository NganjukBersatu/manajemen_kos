<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import NavIcon from './NavIcon.vue'

defineProps({
  open: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

const route = useRoute()
const tagihanTerbuka = ref(route.path.startsWith('/tagihan'))

const menuUtama = [
  { to: '/', label: 'Dashboard', icon: 'home' },
  { to: '/kamar', label: 'Kamar', icon: 'door' },
  { to: '/penghuni', label: 'Penghuni', icon: 'users' },
  { to: '/pembayaran', label: 'Pembayaran', icon: 'wallet' }
]

const tagihanSub = [
  { to: '/tagihan/listrik', label: 'Listrik', icon: 'bolt' },
  { to: '/tagihan/air', label: 'Air', icon: 'drop' },
  { to: '/tagihan/internet', label: 'Internet', icon: 'wifi' }
]

const menuBawah = [
  { to: '/pengeluaran', label: 'Pengeluaran', icon: 'receipt' },
  { to: '/maintenance', label: 'Maintenance', icon: 'wrench' },
  { to: '/laporan', label: 'Laporan', icon: 'chart' },
  { to: '/pengaturan', label: 'Pengaturan', icon: 'gear' }
]

const isTagihanActive = computed(() => route.path.startsWith('/tagihan'))
</script>

<template>
  <!-- Overlay untuk mobile -->
  <div
    v-if="open"
    class="fixed inset-0 bg-black/30 z-30 lg:hidden"
    @click="emit('close')"
  />

  <aside
    class="fixed inset-y-0 left-0 z-40 w-64 bg-brand-600 text-brand-50 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex items-center gap-2.5 px-5 h-16 border-b border-white/10 shrink-0">
      <div class="w-8 h-8 rounded-md bg-gold-500 flex items-center justify-center text-brand-700 font-bold text-sm">
        K
      </div>
      <span class="font-semibold text-[15px] tracking-tight text-white">Kelola Kos</span>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
      <router-link
        v-for="item in menuUtama"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        active-class="nav-item-active"
        exact-active-class="nav-item-active"
        @click="emit('close')"
      >
        <NavIcon :name="item.icon" />
        <span>{{ item.label }}</span>
      </router-link>

      <!-- Tagihan (punya submenu) -->
      <button
        type="button"
        class="nav-item w-full justify-between"
        :class="isTagihanActive ? 'nav-item-active' : ''"
        @click="tagihanTerbuka = !tagihanTerbuka"
      >
        <span class="flex items-center gap-3">
          <NavIcon name="file" />
          <span>Tagihan</span>
        </span>
        <svg
          class="w-3.5 h-3.5 transition-transform"
          :class="tagihanTerbuka ? 'rotate-180' : ''"
          viewBox="0 0 12 12" fill="none"
        >
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <div v-show="tagihanTerbuka" class="ml-4 pl-3 border-l border-white/10 space-y-0.5 py-0.5">
        <router-link
          v-for="item in tagihanSub"
          :key="item.to"
          :to="item.to"
          class="nav-item text-[13.5px] py-2"
          active-class="nav-item-active"
          @click="emit('close')"
        >
          <NavIcon :name="item.icon" small />
          <span>{{ item.label }}</span>
        </router-link>
      </div>

      <div class="h-px bg-white/10 my-3 mx-2" />

      <router-link
        v-for="item in menuBawah"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        active-class="nav-item-active"
        @click="emit('close')"
      >
        <NavIcon :name="item.icon" />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="px-3 py-4 border-t border-white/10">
      <button type="button" class="nav-item text-brand-100/80 hover:text-white w-full">
        <NavIcon name="logout" />
        <span>Keluar</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.nav-item {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium text-brand-100/90 hover:bg-white/10 hover:text-white transition-colors;
}
.nav-item-active {
  @apply bg-white text-brand-600 hover:bg-white hover:text-brand-600;
}
</style>
