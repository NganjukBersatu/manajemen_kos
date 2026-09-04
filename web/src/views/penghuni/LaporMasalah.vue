<script setup>
import { ref, onMounted } from 'vue'

const daftar = ref([])
const loading = ref(true)
const submitting = ref(false)

const form = ref({
  masalah: '',
  catatan: '',
  prioritas: 'sedang'
})

const statusLabel = {
  masuk: 'Masuk',
  diproses: 'Diproses',
  diperbaiki: 'Diperbaiki',
  selesai: 'Selesai'
}
const statusTone = {
  masuk: 'bg-amber-100 text-amber-700',
  diproses: 'bg-brand-50 text-brand-500',
  diperbaiki: 'bg-warn-100 text-warn-600',
  selesai: 'bg-ok-100 text-ok-600'
}

async function muatLaporan() {
  loading.value = true
  try {
    const token = localStorage.getItem('penghuni_token')
    const res = await fetch('/api/penghuni-portal/maintenance', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const json = await res.json()
    if (res.ok) daftar.value = json.data || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function kirimLaporan() {
  if (!form.value.masalah.trim()) return

  submitting.value = true
  try {
    const token = localStorage.getItem('penghuni_token')
    const res = await fetch('/api/penghuni-portal/maintenance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form.value)
    })

    if (!res.ok) throw new Error('Gagal mengirim')

    form.value = { masalah: '', catatan: '', prioritas: 'sedang' }
    await muatLaporan()
    alert('Laporan berhasil dikirim!')
  } catch (err) {
    alert('Gagal mengirim laporan. Coba lagi.')
  } finally {
    submitting.value = false
  }
}

function formatTanggal(t) {
  if (!t) return '-'
  return new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(muatLaporan)
</script>

<template>
  <div>
    <h1 class="text-lg font-semibold text-ink-900 mb-5">Lapor Masalah</h1>

    <!-- Form -->
    <div class="bg-white rounded-xl border border-ink-100 shadow-card p-5 mb-6 max-w-lg">
      <h2 class="text-[14px] font-semibold text-ink-800 mb-4">Kirim Laporan Baru</h2>

      <form class="space-y-4" @submit.prevent="kirimLaporan">
        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Masalah</label>
          <input
            v-model="form.masalah"
            type="text"
            placeholder="Contoh: AC bocor, keran rusak..."
            required
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Catatan (opsional)</label>
          <textarea
            v-model="form.catatan"
            rows="3"
            placeholder="Jelaskan lebih detail..."
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] focus:border-brand-400 focus:outline-none resize-none"
          />
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Prioritas</label>
          <select
            v-model="form.prioritas"
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] focus:border-brand-400 focus:outline-none bg-white"
          >
            <option value="rendah">Rendah</option>
            <option value="sedang">Sedang</option>
            <option value="tinggi">Tinggi</option>
          </select>
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full rounded-lg bg-brand-500 py-2.5 text-[13.5px] font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {{ submitting ? 'Mengirim...' : 'Kirim Laporan' }}
        </button>
      </form>
    </div>

    <!-- Riwayat -->
    <h2 class="text-[14px] font-semibold text-ink-800 mb-3">Riwayat Laporan</h2>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-14 bg-white rounded-xl animate-pulse" />
    </div>

    <div v-else-if="daftar.length === 0" class="bg-white rounded-xl border border-ink-100 p-8 text-center">
      <p class="text-[13.5px] text-ink-500">Belum ada laporan</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="item in daftar"
        :key="item.id"
        class="bg-white rounded-xl border border-ink-100 p-4 shadow-card"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-medium text-ink-900">{{ item.masalah }}</p>
            <p v-if="item.catatan" class="text-[13px] text-ink-500 mt-0.5">{{ item.catatan }}</p>
            <p class="text-[12px] text-ink-400 mt-1">{{ formatTanggal(item.tanggal_laporan) }}</p>
          </div>
          <span
            class="shrink-0 inline-block px-2 py-1 rounded-md text-[11.5px] font-semibold"
            :class="statusTone[item.status]"
          >
            {{ statusLabel[item.status] || item.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>