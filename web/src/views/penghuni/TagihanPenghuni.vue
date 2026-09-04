<script setup>
import { ref, onMounted } from 'vue'

const daftar = ref([])
const loading = ref(true)

const statusLabel = {
  lunas: 'Lunas',
  belum_dibayar: 'Belum Dibayar',
  terlambat: 'Terlambat'
}
const statusTone = {
  lunas: 'bg-ok-100 text-ok-600',
  belum_dibayar: 'bg-amber-100 text-amber-700',
  terlambat: 'bg-danger-100 text-danger-600'
}

async function muatTagihan() {
  loading.value = true
  try {
    const token = localStorage.getItem('penghuni_token')
    const res = await fetch('/api/penghuni-portal/tagihan', {
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

function rupiah(n) {
  if (n == null) return '-'
  return 'Rp' + Number(n).toLocaleString('id-ID')
}

function formatTanggal(t) {
  if (!t) return '-'
  return new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(muatTagihan)
</script>

<template>
  <div>
    <h1 class="text-lg font-semibold text-ink-900 mb-5">Tagihan Saya</h1>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="h-14 bg-white rounded-xl animate-pulse" />
    </div>

    <div v-else-if="daftar.length === 0" class="bg-white rounded-xl border border-ink-100 p-10 text-center">
      <p class="text-[14px] font-medium text-ink-700">Belum ada tagihan</p>
    </div>

    <div v-else class="bg-white rounded-xl border border-ink-100 shadow-card overflow-hidden">
      <table class="w-full text-[13.5px]">
        <thead>
          <tr class="text-left text-ink-500 text-[12px] border-b border-ink-100 bg-ink-100/30">
            <th class="py-3 px-4 font-medium">Jenis</th>
            <th class="py-3 px-4 font-medium">Periode</th>
            <th class="py-3 px-4 font-medium text-right">Total</th>
            <th class="py-3 px-4 font-medium">Jatuh Tempo</th>
            <th class="py-3 px-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in daftar"
            :key="item.jenis + '-' + item.id"
            class="border-b border-ink-100 last:border-0"
          >
            <td class="py-3 px-4 capitalize font-medium text-ink-900">{{ item.jenis }}</td>
            <td class="py-3 px-4 text-ink-600">{{ item.periode }}</td>
            <td class="py-3 px-4 text-right font-medium">{{ rupiah(item.total) }}</td>
            <td class="py-3 px-4 text-ink-500">{{ formatTanggal(item.jatuh_tempo) }}</td>
            <td class="py-3 px-4">
              <span
                class="inline-block px-2 py-1 rounded-md text-[11.5px] font-semibold"
                :class="statusTone[item.status] || 'bg-ink-100 text-ink-600'"
              >
                {{ statusLabel[item.status] || item.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>