<script setup>
import { reactive, watch, ref } from 'vue'
import NavIcon from './NavIcon.vue'

const props = defineProps({
  open: Boolean,
  editing: { type: Object, default: null },
  saving: Boolean
})
const emit = defineEmits(['close', 'submit'])

const daftarPenghuni = ref([])

const form = reactive({
  penghuni_id: '',
  kamar_id: '',
  jumlah_tagihan: '',
  jatuh_tempo: '',
  status: 'belum_dibayar',
  bukti_pembayaran_url: '',
  tanggal_bayar: ''
})

async function muatPenghuni() {
  try {
    const res = await fetch('/api/penghuni')
    const json = await res.json()
    daftarPenghuni.value = json.data
  } catch (err) {
    daftarPenghuni.value = []
  }
}

// Saat penghuni dipilih, otomatis isi kamar_id dari data penghuni itu
function handlePilihPenghuni() {
  const terpilih = daftarPenghuni.value.find((p) => p.id === Number(form.penghuni_id))
  form.kamar_id = terpilih ? terpilih.kamar_id : ''
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      await muatPenghuni()
      form.penghuni_id = props.editing?.penghuni_id || ''
      form.kamar_id = props.editing?.kamar_id || ''
      form.jumlah_tagihan = props.editing?.jumlah_tagihan || ''
      form.jatuh_tempo = props.editing?.jatuh_tempo?.slice(0, 10) || ''
      form.status = props.editing?.status || 'belum_dibayar'
      form.bukti_pembayaran_url = props.editing?.bukti_pembayaran_url || ''
      form.tanggal_bayar = props.editing?.tanggal_bayar?.slice(0, 10) || ''
    }
  }
)

function handleSubmit() {
  if (!form.penghuni_id || !form.kamar_id || !form.jumlah_tagihan || !form.jatuh_tempo) return
  emit('submit', {
    ...form,
    penghuni_id: Number(form.penghuni_id),
    kamar_id: Number(form.kamar_id),
    jumlah_tagihan: Number(form.jumlah_tagihan),
    bukti_pembayaran_url: form.bukti_pembayaran_url || null,
    tanggal_bayar: form.tanggal_bayar || null
  })
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div class="absolute inset-0 bg-black/40" @click="emit('close')" />

    <div class="relative bg-white rounded-card shadow-card w-full max-w-md p-5 lg:p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-[16px] font-semibold text-ink-900">
          {{ editing ? 'Ubah Pembayaran' : 'Tambah Pembayaran' }}
        </h2>
        <button type="button" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink-100 text-ink-500" @click="emit('close')">
          <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Penghuni</label>
          <select
            v-model="form.penghuni_id"
            required
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none bg-white"
            @change="handlePilihPenghuni"
          >
            <option value="" disabled>Pilih penghuni</option>
            <option v-for="p in daftarPenghuni" :key="p.id" :value="p.id">
              {{ p.nama }} — Kamar {{ p.nomor_kamar }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Jumlah Tagihan</label>
          <input
            v-model="form.jumlah_tagihan"
            type="number"
            min="0"
            placeholder="750000"
            required
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Jatuh Tempo</label>
            <input
              v-model="form.jatuh_tempo"
              type="date"
              required
              class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Tanggal Bayar</label>
            <input
              v-model="form.tanggal_bayar"
              type="date"
              class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Status</label>
          <select
            v-model="form.status"
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none bg-white"
          >
            <option value="belum_dibayar">Belum Dibayar</option>
            <option value="lunas">Lunas</option>
            <option value="terlambat">Terlambat</option>
          </select>
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Bukti Pembayaran (link, opsional)</label>
          <input
            v-model="form.bukti_pembayaran_url"
            type="text"
            placeholder="https://..."
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
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