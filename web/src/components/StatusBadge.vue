<script setup>
defineProps({
  status: String
})

const style = {
  terisi: 'bg-ok-100 text-ok-600',
  kosong: 'bg-ink-100 text-ink-500',
  maintenance: 'bg-danger-100 text-danger-600'
}

const label = {
  terisi: 'Terisi',
  kosong: 'Kosong',
  maintenance: 'Maintenance'
}
</script>

<template>
  <span
    class="inline-block px-2 py-1 rounded-md text-[11.5px] font-semibold"
    :class="style[status] || 'bg-ink-100 text-ink-500'"
  >
    {{ label[status] || status }}
  </span>
</template>