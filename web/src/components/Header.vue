<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import NavIcon from './NavIcon.vue'
import { pemilik } from '../data/dummy.js'

const route = useRoute()

const periode = ref('September 2026')
</script>

<template>
  <header class="sticky top-0 z-20 bg-cream/90 backdrop-blur border-b border-ink-100 h-16 flex items-center gap-4 px-4 lg:px-8">
    <!-- Dekorasi saja, bukan tombol -->
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

    <button
      type="button"
      class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-ink-100 text-ink-700 relative"
      aria-label="Notifikasi"
    >
      <NavIcon name="bell" :size="18" />
      <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger-500" />
    </button>

    <div class="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center text-[13px] font-semibold">
      {{ pemilik.nama.charAt(0) }}
    </div>
  </header>
</template>