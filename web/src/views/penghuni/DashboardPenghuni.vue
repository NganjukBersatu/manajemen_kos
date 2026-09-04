<script setup>
import { ref, onMounted } from 'vue'

const profil = ref(null)
const loading = ref(true)

async function muatProfil() {
  loading.value = true
  try {
    const token = localStorage.getItem('penghuni_token')
    const res = await fetch('/api/penghuni-portal/profil', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const json = await res.json()
    if (res.ok) profil.value = json.data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function rupiah(n) {
  if (n == null) return '-'
  return 'Rp' + Number(n).toLocaleString('id-ID')
}

onMounted(muatProfil)
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
    </div>
  </div>
</template>