<script setup>
import NavIcon from './NavIcon.vue'
import { formatWaktuRelatif } from '../data/waktu.js'

defineProps({
  items: { type: Array, required: true }
})

const tipeStyle = {
  pembayaran: { icon: 'wallet', tone: 'bg-ok-100 text-ok-600' },
  maintenance: { icon: 'wrench', tone: 'bg-danger-100 text-danger-600' },
  penghuni: { icon: 'users', tone: 'bg-brand-50 text-brand-500' }
}
</script>

<template>
  <section class="bg-white rounded-card border border-ink-100 shadow-card p-4 lg:p-5">
    <h2 class="text-[15px] font-semibold text-ink-900 mb-4">Aktivitas Terbaru</h2>

    <p v-if="items.length === 0" class="text-[13px] text-ink-500 text-center py-4">
      Belum ada aktivitas.
    </p>

    <ul v-else class="space-y-4">
      <li v-for="(a, i) in items" :key="i" class="flex gap-3">
        <div
          class="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          :class="tipeStyle[a.tipe]?.tone || 'bg-ink-100 text-ink-500'"
        >
          <NavIcon :name="tipeStyle[a.tipe]?.icon || 'file'" :size="13" />
        </div>
        <div class="min-w-0">
          <p class="text-[13.5px] text-ink-900 leading-snug">{{ a.teks }}</p>
          <p class="text-[12px] text-ink-500 mt-0.5">{{ formatWaktuRelatif(a.waktu) }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>