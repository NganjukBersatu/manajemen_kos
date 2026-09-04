<script setup>
import { reactive, watch, onMounted, ref } from 'vue'
import NavIcon from './NavIcon.vue'

const props = defineProps({
  open: Boolean,
  editing: { type: Object, default: null },
  saving: Boolean
})
const emit = defineEmits(['close', 'submit'])

const daftarKamar = ref([])

async function muatKamar() {
  try {
    const res = await fetch('/api/kamar')
    const json = await res.json()
    daftarKamar.value = json.data || []
  } catch (err) {
    console.error('Gagal memuat kamar:', err)
    daftarKamar.value = []
  }
}

function hariIni() {
  return new Date().toISOString().slice(0, 10)
}

const form = reactive({
  kamar_id: '',
  masalah: '',
  catatan: '',
  status: 'masuk',
  prioritas: 'sedang',
  tanggal_laporan: hariIni(),
  biaya: ''
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      // Reset / isi form saat modal dibuka
      form.kamar_id = props.editing?.kamar_id || ''
      form.masalah = props.editing?.masalah || ''
      form.catatan = props.editing?.catatan || ''
      form.status = props.editing?.status || 'masuk'
      form.prioritas = props.editing?.prioritas || 'sedang'
      form.tanggal_laporan = props.editing?.tanggal_laporan?.slice(0, 10) || hariIni()
      form.biaya = props.editing?.biaya ?? ''

      // Pastikan data kamar sudah ter-load
      if (daftarKamar.value.length === 0) {
        muatKamar()
      }
    }
  }
)

function handleSubmit() {
  if (!form.kamar_id || !form.masalah) return

  emit('submit', {
    kamar_id: Number(form.kamar_id),
    masalah: form.masalah,
    catatan: form.catatan || null,
    status: form.status,
    prioritas: form.prioritas,
    tanggal_laporan: form.tanggal_laporan,
    biaya: form.biaya === '' ? null : Number(form.biaya)
  })
}

onMounted(() => {
  muatKamar()
})
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/40" @click="emit('close')" />

    <!-- Modal Box -->
    <div
      class="relative bg-white rounded-card shadow-card w-full max-w-md max-h-[90vh] flex flex-col my-auto"
    >
      <!-- Header (tetap di atas) -->
      <div class="flex items-center justify-between p-5 lg:p-6 border-b border-ink-100 shrink-0">
        <h2 class="text-[16px] font-semibold text-ink-900">
          {{ editing ? 'Ubah Laporan Maintenance' : 'Tambah Laporan Maintenance' }}
        </h2>
        <button
          type="button"
          class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink-100 text-ink-500"
          @click="emit('close')"
        >
          <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <!-- Body (bisa di-scroll) -->
      <div class="overflow-y-auto p-5 lg:p-6">
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <!-- Kamar -->
          <div>
            <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Kamar</label>
            <select
              v-model="form.kamar_id"
              required
              class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none bg-white"
            >
              <option value="" disabled>Pilih kamar</option>
              <option
                v-for="k in daftarKamar"
                :key="k.id"
                :value="k.id"
              >
                {{ k.nomor_kamar }}
              </option>
            </select>
            <p v-if="daftarKamar.length === 0" class="text-[12px] text-red-500 mt-1">
              Tidak ada data kamar. Pastikan API /api/kamar berjalan.
            </p>
          </div>

          <!-- Masalah / Judul -->
          <div>
            <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Masalah / Judul Kerusakan</label>
            <input
              v-model="form.masalah"
              type="text"
              placeholder="AC bocor, keran rusak, dll."
              required
              class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
            />
          </div>

          <!-- Catatan / Deskripsi -->
          <div>
            <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Catatan / Deskripsi</label>
            <textarea
              v-model="form.catatan"
              rows="3"
              placeholder="Detail kerusakan (opsional)"
              class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none resize-none"
            />
          </div>

          <!-- Tanggal Lapor & Prioritas -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Tanggal Lapor</label>
              <input
                v-model="form.tanggal_laporan"
                type="date"
                required
                class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Prioritas</label>
              <select
                v-model="form.prioritas"
                class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none bg-white"
              >
                <option value="rendah">Rendah</option>
                <option value="sedang">Sedang</option>
                <option value="tinggi">Tinggi</option>
              </select>
            </div>
          </div>

          <!-- Biaya -->
          <div>
            <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Estimasi/Biaya Perbaikan (Rp)</label>
            <input
              v-model="form.biaya"
              type="number"
              min="0"
              placeholder="Opsional"
              class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
            />
          </div>

          <!-- Status -->
          <div>
            <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Status</label>
            <select
              v-model="form.status"
              class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none bg-white"
            >
              <option value="masuk">Masuk</option>
              <option value="diproses">Diproses</option>
              <option value="diperbaiki">Diperbaiki</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
        </form>
      </div>

      <!-- Footer (tetap di bawah) -->
      <div class="flex gap-3 p-5 lg:p-6 border-t border-ink-100 shrink-0">
        <button
          type="button"
          class="flex-1 rounded-lg border border-ink-100 py-2.5 text-[13.5px] font-semibold text-ink-700 hover:bg-ink-100/60"
          @click="emit('close')"
        >
          Batal
        </button>
        <button
          type="button"
          :disabled="saving"
          class="flex-1 rounded-lg bg-brand-500 py-2.5 text-[13.5px] font-semibold text-white hover:bg-brand-600 disabled:opacity-60 flex items-center justify-center gap-2"
          @click="handleSubmit"
        >
          <NavIcon v-if="saving" name="gear" :size="14" class="animate-spin" />
          {{ saving ? 'Menyimpan...' : 'Simpan' }}
        </button>
      </div>
    </div>
  </div>
</template>