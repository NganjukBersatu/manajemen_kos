<script setup>
import NavIcon from './NavIcon.vue'

defineProps({
  label: String,
  value: String,
  sub: String,
  subTone: { type: String, default: 'neutral' }, // neutral | ok | warn | danger
  icon: String,
  iconTone: { type: String, default: 'brand' } // brand | ok | warn | danger | gold
})

const toneBg = {
  brand: 'bg-brand-50 text-brand-500',
  ok: 'bg-ok-100 text-ok-600',
  warn: 'bg-warn-100 text-warn-600',
  danger: 'bg-danger-100 text-danger-600',
  gold: 'bg-gold-100 text-gold-600'
}

const subColor = {
  neutral: 'text-ink-500',
  ok: 'text-ok-600',
  warn: 'text-warn-600',
  danger: 'text-danger-600'
}
</script>

<template>
  <div class="bg-white rounded-card border border-ink-100 shadow-card p-4 lg:p-5">
    <div class="flex items-start justify-between">
      <p class="text-[13px] font-medium text-ink-500">{{ label }}</p>
      <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="toneBg[iconTone]">
        <NavIcon :name="icon" :size="16" />
      </div>
    </div>
    <p class="mt-2.5 text-2xl font-bold text-ink-900 tracking-tight">{{ value }}</p>
    <p v-if="sub" class="mt-1 text-[12.5px] font-medium" :class="subColor[subTone]">{{ sub }}</p>
  </div>
</template>
