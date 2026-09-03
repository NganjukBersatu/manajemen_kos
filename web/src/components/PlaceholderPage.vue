<script setup>
import NavIcon from './NavIcon.vue'

defineProps({
  title: String,
  description: String,
  icon: { type: String, default: 'file' }
})
</script>

<template>
  <div class="bg-white rounded-card border border-ink-100 shadow-card p-8 lg:p-12 flex flex-col items-center text-center max-w-md mx-auto mt-6">
    <div class="w-12 h-12 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mb-4">
      <NavIcon :name="icon" :size="22" />
    </div>
    <h2 class="text-[16px] font-semibold text-ink-900">{{ title }}</h2>
    <p class="text-[13.5px] text-ink-500 mt-2 leading-relaxed">{{ description }}</p>
    <p class="text-[12px] text-ink-300 mt-4">Halaman ini akan dibangun pada tahap berikutnya.</p>
  </div>
</template>
