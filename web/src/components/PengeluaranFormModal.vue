<script setup>
import { reactive, watch } from 'vue'
import NavIcon from './NavIcon.vue'

const props = defineProps({
  open: Boolean,
  editing: { type: Object, default: null },
  saving: Boolean
})
const emit = defineEmits(['close', 'submit'])

const kategoriOptions = [
  { value: 'listrik', label: 'Listrik' },
  { value: 'air', label: 'Air' },
  { value: 'internet', label: 'Internet' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'kebersihan', label: 'Kebersihan' },
  { value: 'gaji', label: 'Gaji Penjaga' },
  { value: 'perlengkapan', label: 'Perlengkapan' },
  { value: 'lainnya', label: 'Lainnya' }
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

const form = reactive({
  kategori: 'lainnya',
  jumlah: '',
  deskripsi: '',
  tanggal: todayStr()
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      form.kategori = props.editing?.kategori || 'lainnya'
      form.jumlah = props.editing?.jumlah || ''
      form.deskripsi = props.editing?.deskripsi || ''
      form.tanggal = props.editing?.tanggal?.slice(0, 10) || todayStr()
    }
  }
)

function handleSubmit() {
  if (!form.kategori || !form.jumlah || !form.tanggal) return
  emit('submit', { ...form, jumlah: Number(form.jumlah) })
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div class="absolute inset-0 bg-black/40" @click="emit('close')" />

    <div class="relative bg-white rounded-card shadow-card w-full max-w-md p-5 lg:p-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-[16px] font-semibold text-ink-900">
          {{ editing ? 'Ubah Pengeluaran' : 'Tambah Pengeluaran' }}
        </h2>
        <button type="button" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink-100 text-ink-500" @click="emit('close')">
          <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Kategori</label>
          <select
            v-model="form.kategori"
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none bg-white"
          >
            <option v-for="opt in kategoriOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Jumlah (Rp)</label>
          <input
            v-model="form.jumlah"
            type="number"
            min="0"
            placeholder="500000"
            required
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Tanggal</label>
          <input
            v-model="form.tanggal"
            type="date"
            required
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Keterangan</label>
          <textarea
            v-model="form.deskripsi"
            rows="2"
            placeholder="Contoh: Beli galon dan sabun cuci"
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none resize-none"
          />
        </div>

        <div class="flex gap-3 pt-2">
          <button
            type="button"
            class="flex-1 rounded-lg border border-ink-100 py-2.5 text-[13.5px] font-semibold text-ink-700 hover:bg-ink-100/60"
            @click="emit('close')"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="flex-1 rounded-lg bg-brand-500 py-2.5 text-[13.5px] font-semibold text-white hover:bg-brand-600 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <NavIcon v-if="saving" name="gear" :size="14" class="animate-spin" />
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>