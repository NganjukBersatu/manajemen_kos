<script setup>
import { computed } from 'vue'
import { statusKamar } from '../data/dummy.js'

const total = statusKamar.terisi + statusKamar.kosong + statusKamar.maintenance

const segments = computed(() => {
  const items = [
    { label: 'Terisi', value: statusKamar.terisi, color: '#1F5F5B' },
    { label: 'Kosong', value: statusKamar.kosong, color: '#D9A448' },
    { label: 'Maintenance', value: statusKamar.maintenance, color: '#B44B3D' }
  ]
  const r = 15.9155
  const circumference = 2 * Math.PI * r
  let offset = 0
  return items.map((it) => {
    const fraction = it.value / total
    const dash = fraction * circumference
    const seg = { ...it, dash, gap: circumference - dash, offset: -offset, circumference }
    offset += dash
    return seg
  })
})
</script>

<template>
  <section class="bg-white rounded-card border border-ink-100 shadow-card p-4 lg:p-5">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-[15px] font-semibold text-ink-900">Status Kamar</h2>
      <router-link to="/kamar" class="text-[12.5px] font-semibold text-brand-500 hover:text-brand-600">
        Lihat Semua Kamar →
      </router-link>
    </div>

    <div class="flex items-center gap-6">
      <div class="relative w-32 h-32 shrink-0">
        <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#E4E9E6" stroke-width="3.6" />
          <circle
            v-for="seg in segments"
            :key="seg.label"
            cx="18" cy="18" r="15.9155" fill="none"
            :stroke="seg.color"
            stroke-width="3.6"
            stroke-linecap="round"
            :stroke-dasharray="`${seg.dash} ${seg.gap}`"
            :stroke-dashoffset="seg.offset"
          />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-xl font-bold text-ink-900">{{ total }}</span>
          <span class="text-[11px] text-ink-500">kamar</span>
        </div>
      </div>

      <ul class="flex-1 space-y-2.5">
        <li v-for="seg in segments" :key="seg.label" class="flex items-center justify-between text-[13.5px]">
          <span class="flex items-center gap-2 text-ink-700">
            <span class="w-2.5 h-2.5 rounded-full" :style="{ background: seg.color }" />
            {{ seg.label }}
          </span>
          <span class="font-semibold text-ink-900">{{ seg.value }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
