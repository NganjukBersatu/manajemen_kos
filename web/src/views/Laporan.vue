<script setup>
import { ref, computed, onMounted } from 'vue'
import NavIcon from '../components/NavIcon.vue'

const loading = ref(true)
const errorMsg = ref('')

const ringkasan = ref({
  total_pemasukan: 0,
  total_pengeluaran: 0,
  keuntungan: 0,
  total_kamar: 0,
  kamar_terisi: 0,
  okupansi_persen: 0
})
const rincian = ref([])

function rupiah(n) {
  return 'Rp' + Number(n).toLocaleString('id-ID')
}

function tanggal(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const namaBulanIni = computed(() => {
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date())
})

async function muatLaporan() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await fetch('/api/laporan')
    if (!res.ok) throw new Error('Gagal memuat data laporan')
    const json = await res.json()
    ringkasan.value = json.data.ringkasan
    rincian.value = json.data.rincian
  } catch (err) {
    errorMsg.value = 'Tidak bisa terhubung ke server. Pastikan backend (folder api) sedang berjalan.'
  } finally {
    loading.value = false
  }
}

onMounted(muatLaporan)
</script>

<template>
  <div>
    <p class="text-[13.5px] text-ink-500 mb-5">Laporan periode {{ namaBulanIni }}</p>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-card border border-ink-100 shadow-card p-6">
      <div v-for="i in 4" :key="i" class="h-10 bg-ink-100/60 rounded-lg animate-pulse mb-2 last:mb-0" />
    </div>

    <!-- Error -->
    <div v-else-if="errorMsg" class="bg-white rounded-card border border-danger-100 shadow-card p-8 text-center max-w-md mx-auto mt-6">
      <div class="w-12 h-12 rounded-xl bg-danger-100 text-danger-600 flex items-center justify-center mx-auto mb-4">
        <NavIcon name="alert" :size="22" />
      </div>
      <p class="text-[13.5px] text-ink-700">{{ errorMsg }}</p>
      <button type="button" class="mt-4 text-[13px] font-semibold text-brand-500 hover:text-brand-600" @click="muatLaporan">
        Coba lagi
      </button>
    </div>

    <template v-else>
      <!-- Kartu ringkasan -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-card border border-ink-100 shadow-card p-5">
          <p class="text-[12.5px] text-ink-500 mb-1">Total Pemasukan</p>
          <p class="text-[20px] font-bold text-emerald-600">{{ rupiah(ringkasan.total_pemasukan) }}</p>
        </div>
        <div class="bg-white rounded-card border border-ink-100 shadow-card p-5">
          <p class="text-[12.5px] text-ink-500 mb-1">Total Pengeluaran</p>
          <p class="text-[20px] font-bold text-danger-600">{{ rupiah(ringkasan.total_pengeluaran) }}</p>
        </div>
        <div class="bg-white rounded-card border border-ink-100 shadow-card p-5">
          <p class="text-[12.5px] text-ink-500 mb-1">Keuntungan</p>
          <p
            class="text-[20px] font-bold"
            :class="ringkasan.keuntungan >= 0 ? 'text-brand-600' : 'text-danger-600'"
          >
            {{ rupiah(ringkasan.keuntungan) }}
          </p>
        </div>
        <div class="bg-white rounded-card border border-ink-100 shadow-card p-5">
          <p class="text-[12.5px] text-ink-500 mb-1">Okupansi Kamar</p>
          <p class="text-[20px] font-bold text-ink-900">
            {{ ringkasan.okupansi_persen }}%
            <span class="text-[12.5px] font-normal text-ink-400">
              ({{ ringkasan.kamar_terisi }}/{{ ringkasan.total_kamar }})
            </span>
          </p>
        </div>
      </div>

      <!-- Tabel rincian transaksi -->
      <div v-if="rincian.length === 0" class="bg-white rounded-card border border-ink-100 shadow-card p-10 text-center max-w-md mx-auto">
        <div class="w-12 h-12 rounded-xl bg-ink-100 text-ink-500 flex items-center justify-center mx-auto mb-4">
          <NavIcon name="wallet" :size="22" />
        </div>
        <p class="text-[14px] font-semibold text-ink-900">Belum ada transaksi bulan ini</p>
        <p class="text-[13px] text-ink-500 mt-1.5">Pemasukan dan pengeluaran bulan ini akan muncul di sini.</p>
      </div>

      <div v-else class="bg-white rounded-card border border-ink-100 shadow-card overflow-hidden">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-ink-100 bg-ink-50/50">
              <th class="px-4 py-3 text-[12.5px] font-semibold text-ink-500">Tanggal</th>
              <th class="px-4 py-3 text-[12.5px] font-semibold text-ink-500">Jenis</th>
              <th class="px-4 py-3 text-[12.5px] font-semibold text-ink-500">Keterangan</th>
              <th class="px-4 py-3 text-[12.5px] font-semibold text-ink-500">Kamar</th>
              <th class="px-4 py-3 text-[12.5px] font-semibold text-ink-500 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(t, idx) in rincian"
              :key="idx"
              class="border-b border-ink-100 last:border-0 hover:bg-ink-50/40"
            >
              <td class="px-4 py-3 text-[12.5px] text-ink-500">{{ tanggal(t.tanggal) }}</td>
              <td class="px-4 py-3">
                <span
                  class="px-2.5 py-1 rounded-full text-[11.5px] font-semibold"
                  :class="t.jenis === 'pemasukan' ? 'bg-emerald-100 text-emerald-700' : 'bg-danger-100 text-danger-600'"
                >
                  {{ t.jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran' }}
                </span>
              </td>
              <td class="px-4 py-3 text-[13.5px] text-ink-900">{{ t.keterangan }}</td>
              <td class="px-4 py-3 text-[13px] text-ink-700">{{ t.kamar || '-' }}</td>
              <td
                class="px-4 py-3 text-[13px] font-semibold text-right"
                :class="t.jenis === 'pemasukan' ? 'text-emerald-600' : 'text-danger-600'"
              >
                {{ t.jenis === 'pemasukan' ? '+' : '-' }}{{ rupiah(t.jumlah) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>