<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import NavIcon from './NavIcon.vue'
import { pemilik } from '../data/dummy.js'
import { aktivitasState } from '../data/aktivitasStore.js'
import { formatWaktuRelatif } from '../data/waktu.js'

const route = useRoute()

const periode = computed(() => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
})

const showNotif = ref(false)
const notifRef = ref(null)

const daftarAktivitas = computed(() =>
  [...aktivitasState.daftar]
    .sort((a, b) => new Date(b.waktu) - new Date(a.waktu))
    .slice(0, 5)
)

const showProfil = ref(false)
const profilRef = ref(null)

function toggleNotif() {
  showNotif.value = !showNotif.value
  showProfil.value = false
}
function toggleProfil() {
  showProfil.value = !showProfil.value
  showNotif.value = false
}
function handleClickOutside(e) {
  if (notifRef.value && !notifRef.value.contains(e.target)) showNotif.value = false
  if (profilRef.value && !profilRef.value.contains(e.target)) showProfil.value = false
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <header class="sticky top-0 z-20 bg-cream/90 backdrop-blur border-b border-ink-100 h-16 flex items-center gap-4 px-4 lg:px-8">
    <span class="w-9 h-9 flex items-center justify-center rounded-lg text-ink-700 shrink-0" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5">
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    </span>

    <div class="flex-1 min-w-0">
      <h1 class="text-[17px] font-semibold text-ink-900 leading-tight truncate">
        {{ route.meta.title || 'Dashboard' }}
      </h1>
      <p v-if="route.name === 'dashboard'" class="text-[13px] text-ink-500 leading-tight">
        Selamat datang kembali, {{ pemilik.nama }}
      </p>
    </div>

    <button
      type="button"
      class="hidden sm:flex items-center gap-2 rounded-lg border border-ink-100 bg-white px-3 py-2 text-[13px] font-medium text-ink-700 hover:border-ink-300"
    >
      <NavIcon name="filter" :size="15" />
      {{ periode }}
    </button>

    <!-- Notifikasi / Aktivitas Terbaru -->
    <div class="relative" ref="notifRef">
      <button
        type="button"
        class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-ink-100 text-ink-700 relative"
        aria-label="Notifikasi"
        @click.stop="toggleNotif"
      >
        <NavIcon name="bell" :size="18" />
        <span
          v-if="daftarAktivitas.length"
          class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger-500"
        />
      </button>

      <div
        v-if="showNotif"
        class="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-ink-100 bg-white shadow-lg py-2 z-30"
      >
        <p class="px-4 py-2 text-[13px] font-semibold text-ink-900 border-b border-ink-100">
          Aktivitas Terbaru
        </p>
        <ul v-if="daftarAktivitas.length" class="divide-y divide-ink-100">
          <li
            v-for="item in daftarAktivitas"
            :key="item.id"
            class="px-4 py-3 text-[13px] text-ink-700 hover:bg-ink-50"
          >
            <p class="leading-tight">{{ item.teks }}</p>
            <p class="text-[11px] text-ink-400 mt-0.5">{{ formatWaktuRelatif(item.waktu) }}</p>
          </li>
        </ul>
        <p v-else class="px-4 py-3 text-[13px] text-ink-400">Belum ada aktivitas.</p>
      </div>
    </div>

    <!-- Avatar / Profil Pemilik -->
    <div class="relative" ref="profilRef">
      <button
        type="button"
        class="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center text-[13px] font-semibold"
        aria-label="Profil"
        @click.stop="toggleProfil"
      >
        {{ pemilik.nama.charAt(0) }}
      </button>

      <div
        v-if="showProfil"
        class="absolute right-0 mt-2 w-56 rounded-xl border border-ink-100 bg-white shadow-lg py-2 z-30"
      >
        <div class="px-4 py-2 border-b border-ink-100">
          <p class="text-[13px] font-semibold text-ink-900 truncate">{{ pemilik.nama }}</p>
          <p v-if="pemilik.email" class="text-[12px] text-ink-400 truncate">{{ pemilik.email }}</p>
        </div>
        <router-link
          to="/pengaturan"
          class="block px-4 py-2 text-[13px] text-ink-700 hover:bg-ink-50"
          @click="showProfil = false"
        >
          Lihat Profil
        </router-link>
      </div>
    </div>
  </header>
</template>