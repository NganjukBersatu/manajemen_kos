<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavIcon from './NavIcon.vue'

const props = defineProps({
  collapsed: { type: Boolean, default: false }
})
const emit = defineEmits(['toggle'])

const route = useRoute()
const router = useRouter()
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

function klikTagihan() {
  if (props.collapsed) {
    emit('toggle')
    tagihanTerbuka.value = true
  } else {
    tagihanTerbuka.value = !tagihanTerbuka.value
  }
}

function logout() {
  if (!confirm('Yakin ingin keluar?')) return
  localStorage.removeItem('kos_user')
  router.push('/login')
}
</script>

<template>
  <aside
    class="fixed top-0 left-0 h-screen z-40 bg-brand-600 text-brand-50 flex flex-col transition-all duration-200"
    :class="collapsed ? 'w-20' : 'w-64'"
  >
    <!-- Header sidebar: logo + tombol toggle -->
    <div
      class="flex items-center h-16 border-b border-white/10 shrink-0"
      :class="collapsed ? 'justify-center px-2' : 'justify-between px-4'"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-8 h-8 rounded-md bg-gold-500 flex items-center justify-center text-brand-700 font-bold text-sm shrink-0">
          K
        </div>
        <span v-if="!collapsed" class="font-semibold text-[15px] tracking-tight text-white truncate">
          Kelola Kos
        </span>
      </div>

      <button
        v-if="!collapsed"
        type="button"
        class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-brand-100/80 hover:text-white shrink-0"
        aria-label="Tutup sidebar"
        @click="emit('toggle')"
      >
        <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <!-- Tombol buka, muncul saat collapsed -->
    <button
      v-if="collapsed"
      type="button"
      class="mx-auto mt-2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-brand-100/80 hover:text-white"
      aria-label="Buka sidebar"
      @click="emit('toggle')"
    >
      <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
        <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <nav class="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-0.5">
      <router-link
        v-for="item in menuUtama"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="collapsed ? 'justify-center px-0' : ''"
        active-class="nav-item-active"
        exact-active-class="nav-item-active"
        :title="collapsed ? item.label : ''"
      >
        <NavIcon :name="item.icon" />
        <span v-if="!collapsed">{{ item.label }}</span>
      </router-link>

      <!-- Tagihan (punya submenu) -->
      <button
        type="button"
        class="nav-item"
        :class="[collapsed ? 'justify-center px-0' : 'w-full justify-between', isTagihanActive ? 'nav-item-active' : '']"
        :title="collapsed ? 'Tagihan' : ''"
        @click="klikTagihan"
      >
        <span class="flex items-center gap-3">
          <NavIcon name="file" />
          <span v-if="!collapsed">Tagihan</span>
        </span>
        <svg
          v-if="!collapsed"
          class="w-3.5 h-3.5 transition-transform"
          :class="tagihanTerbuka ? 'rotate-180' : ''"
          viewBox="0 0 12 12" fill="none"
        >
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <div v-show="tagihanTerbuka && !collapsed" class="ml-4 pl-3 border-l border-white/10 space-y-0.5 py-0.5">
        <router-link
          v-for="item in tagihanSub"
          :key="item.to"
          :to="item.to"
          class="nav-item text-[13.5px] py-2"
          active-class="nav-item-active"
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
        :class="collapsed ? 'justify-center px-0' : ''"
        active-class="nav-item-active"
        :title="collapsed ? item.label : ''"
      >
        <NavIcon :name="item.icon" />
        <span v-if="!collapsed">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="px-3 py-4 border-t border-white/10">
      <button
        type="button"
        class="nav-item text-brand-100/80 hover:text-white w-full"
        :class="collapsed ? 'justify-center px-0' : ''"
        :title="collapsed ? 'Keluar' : ''"
        @click="logout"
      >
        <NavIcon name="logout" />
        <span v-if="!collapsed">Keluar</span>
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