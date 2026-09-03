<script setup>
import { reactive, watch } from 'vue'
import NavIcon from './NavIcon.vue'

const props = defineProps({
  open: Boolean,
  editing: { type: Object, default: null }, // null = mode tambah, object = mode edit
  saving: Boolean
})
const emit = defineEmits(['close', 'submit'])

const form = reactive({
  nomor_kamar: '',
  harga: '',
  status: 'kosong',
  fasilitas: ''
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      form.nomor_kamar = props.editing?.nomor_kamar || ''
      form.harga = props.editing?.harga || ''
      form.status = props.editing?.status || 'kosong'
      form.fasilitas = props.editing?.fasilitas || ''
    }
  }
)

function handleSubmit() {
  if (!form.nomor_kamar || !form.harga) return
  emit('submit', { ...form, harga: Number(form.harga) })
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div class="absolute inset-0 bg-black/40" @click="emit('close')" />

    <div class="relative bg-white rounded-card shadow-card w-full max-w-md p-5 lg:p-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-[16px] font-semibold text-ink-900">
          {{ editing ? 'Ubah Kamar' : 'Tambah Kamar' }}
        </h2>
        <button type="button" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink-100 text-ink-500" @click="emit('close')">
          <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Nomor Kamar</label>
          <input
            v-model="form.nomor_kamar"
            type="text"
            placeholder="Contoh: A01"
            required
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Harga Sewa / bulan</label>
          <input
            v-model="form.harga"
            type="number"
            min="0"
            placeholder="750000"
            required
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Status</label>
          <select
            v-model="form.status"
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none bg-white"
          >
            <option value="kosong">Kosong</option>
            <option value="terisi">Terisi</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Fasilitas</label>
          <textarea
            v-model="form.fasilitas"
            rows="2"
            placeholder="Kasur, lemari, AC, kamar mandi dalam"
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