<script setup>
import { ref, onMounted, computed } from 'vue'

const profil = ref(null)
const tagihan = ref([])
const loading = ref(true)

async function muatProfil() {
  try {
    const token = localStorage.getItem('penghuni_token')
    const res = await fetch('/api/penghuni-portal/profil', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const json = await res.json()
    if (res.ok) profil.value = json.data
  } catch (err) {
    console.error(err)
  }
}

async function muatTagihan() {
  try {
    const token = localStorage.getItem('penghuni_token')
    const res = await fetch('/api/penghuni-portal/tagihan', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const json = await res.json()
    if (res.ok) tagihan.value = json.data || []
  } catch (err) {
    console.error(err)
  }
}

async function muatSemua() {
  loading.value = true
  await Promise.all([muatProfil(), muatTagihan()])
  loading.value = false
}

// Semua tagihan yang belum lunas (belum_dibayar atau terlambat)
const tagihanBelumLunas = computed(() =>
  tagihan.value.filter((t) => t.status !== 'lunas')
)

// Total nominal yang harus dibayar
const totalBelumDibayar = computed(() =>
  tagihanBelumLunas.value.reduce((sum, t) => sum + Number(t.total || 0), 0)
)

// 3 tagihan dengan jatuh tempo terdekat
const tagihanTerdekat = computed(() =>
  [...tagihanBelumLunas.value]
    .sort((a, b) => new Date(a.jatuh_tempo) - new Date(b.jatuh_tempo))
    .slice(0, 3)
)

function rupiah(n) {
  if (n == null) return '-'
  return 'Rp' + Number(n).toLocaleString('id-ID')
}

function formatTanggal(t) {
  if (!t) return '-'
  return new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function sudahLewatTempo(t) {
  return new Date(t) < new Date().setHours(0, 0, 0, 0)
}

const jenisLabel = {
  listrik: 'Listrik',
  air: 'Air',
  internet: 'Internet',
  sewa: 'Sewa Kamar'
}

onMounted(muatSemua)
</script>

<template>
  <div>
    <h1 class="text-lg font-semibold text-ink-900 mb-5">Dashboard</h1>

    <div v-if="loading" class="space-y-3">
      <div class="h-24 bg-white rounded-xl animate-pulse" />
      <div class="h-24 bg-white rounded-xl animate-pulse" />
    </div>

    <div v-else-if="profil" class="grid gap-4 sm:grid-cols-2 max-w-2xl">
      <!-- Info Kamar -->
      <div class="bg-white rounded-xl border border-ink-100 p-5 shadow-card">
        <p class="text-[12px] text-ink-500 mb-1">Kamar</p>
        <p class="text-xl font-semibold text-ink-900">{{ profil.nomor_kamar }}</p>
        <p class="text-[13px] text-ink-500 mt-1">{{ profil.nama }}</p>
      </div>

      <!-- Biaya Sewa -->
      <div class="bg-white rounded-xl border border-ink-100 p-5 shadow-card">
        <p class="text-[12px] text-ink-500 mb-1">Biaya Sewa Bulanan</p>
        <p class="text-xl font-semibold text-brand-500">{{ rupiah(profil.harga_sewa) }}</p>
        <p class="text-[13px] text-ink-500 mt-1">per bulan</p>
      </div>

      <!-- Status -->
      <div class="bg-white rounded-xl border border-ink-100 p-5 shadow-card sm:col-span-2">
        <p class="text-[12px] text-ink-500 mb-1">Status</p>
        <span class="inline-block px-2.5 py-1 rounded-md text-[12px] font-semibold bg-ok-100 text-ok-600">
          {{ profil.status === 'aktif' ? 'Aktif' : profil.status }}
        </span>
        <p class="text-[13px] text-ink-500 mt-2">
          Tanggal masuk: {{ profil.tanggal_masuk ? new Date(profil.tanggal_masuk).toLocaleDateString('id-ID') : '-' }}
        </p>
      </div>

      <!-- Total Tagihan Belum Dibayar -->
      <div
        class="rounded-xl p-5 shadow-card sm:col-span-2"
        :class="totalBelumDibayar > 0 ? 'bg-danger-50 border border-danger-100' : 'bg-ok-50 border border-ok-100'"
      >
        <p class="text-[12px] mb-1" :class="totalBelumDibayar > 0 ? 'text-danger-600' : 'text-ok-600'">
          Total Tagihan Belum Dibayar
        </p>
        <p
          class="text-2xl font-bold"
          :class="totalBelumDibayar > 0 ? 'text-danger-600' : 'text-ok-600'"
        >
          {{ totalBelumDibayar > 0 ? rupiah(totalBelumDibayar) : 'Lunas Semua ✓' }}
        </p>
        <p v-if="totalBelumDibayar > 0" class="text-[13px] text-danger-500 mt-1">
          Dari {{ tagihanBelumLunas.length }} tagihan yang belum dibayar
        </p>
      </div>

      <!-- Ringkasan Tagihan Terdekat -->
      <div v-if="tagihanTerdekat.length > 0" class="bg-white rounded-xl border border-ink-100 shadow-card sm:col-span-2 overflow-hidden">
        <div class="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
          <p class="text-[13.5px] font-semibold text-ink-800">Tagihan Terdekat</p>
          <router-link to="/penghuni/tagihan" class="text-[12.5px] font-semibold text-brand-500 hover:text-brand-600">
            Lihat semua →
          </router-link>
        </div>
        <div>
          <div
            v-for="item in tagihanTerdekat"
            :key="item.jenis + '-' + item.id"
            class="flex items-center justify-between px-5 py-3 border-b border-ink-100 last:border-0"
          >
            <div>
              <p class="text-[13.5px] font-medium text-ink-900">{{ jenisLabel[item.jenis] || item.jenis }}</p>
              <p
                class="text-[12px] mt-0.5"
                :class="sudahLewatTempo(item.jatuh_tempo) ? 'text-danger-500 font-medium' : 'text-ink-500'"
              >
                Jatuh tempo {{ formatTanggal(item.jatuh_tempo) }}
                <span v-if="sudahLewatTempo(item.jatuh_tempo)">(Terlambat)</span>
              </p>
            </div>
            <p class="text-[14px] font-semibold text-ink-900">{{ rupiah(item.total) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>