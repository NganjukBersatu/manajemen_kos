<script setup>
import { ref, onMounted } from 'vue'
import StatCard from '../components/StatCard.vue'
import AttentionPanel from '../components/AttentionPanel.vue'
import RoomStatusDonut from '../components/RoomStatusDonut.vue'
import RecentPayments from '../components/RecentPayments.vue'
import FinanceChart from '../components/FinanceChart.vue'
import RecentActivity from '../components/RecentActivity.vue'
import NavIcon from '../components/NavIcon.vue'

const loading = ref(true)
const errorMsg = ref('')
const dashboard = ref(null)

function rupiah(n) {
  return 'Rp' + Number(n).toLocaleString('id-ID')
}

async function muatDashboard() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await fetch('/api/dashboard')
    if (!res.ok) throw new Error('Gagal memuat data dashboard')
    dashboard.value = await res.json()
  } catch (err) {
    errorMsg.value = 'Tidak bisa terhubung ke server. Pastikan backend (folder api) sedang berjalan.'
  } finally {
    loading.value = false
  }
}

onMounted(muatDashboard)
</script>

<template>
  <div>
    <div v-if="loading" class="bg-white rounded-card border border-ink-100 shadow-card p-6">
      <div v-for="i in 4" :key="i" class="h-10 bg-ink-100/60 rounded-lg animate-pulse mb-2 last:mb-0" />
    </div>

    <div v-else-if="errorMsg" class="bg-white rounded-card border border-danger-100 shadow-card p-8 text-center max-w-md mx-auto mt-6">
      <div class="w-12 h-12 rounded-xl bg-danger-100 text-danger-600 flex items-center justify-center mx-auto mb-4">
        <NavIcon name="alert" :size="22" />
      </div>
      <p class="text-[13.5px] text-ink-700">{{ errorMsg }}</p>
      <button type="button" class="mt-4 text-[13px] font-semibold text-brand-500 hover:text-brand-600" @click="muatDashboard">
        Coba lagi
      </button>
    </div>

    <div v-else class="space-y-5 lg:space-y-6">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          label="Total Kamar"
          :value="`${dashboard.statistik.totalKamar} Kamar`"
          :sub="`${dashboard.statistik.kamarTerisi} terisi · ${dashboard.statistik.kamarKosong} kosong`"
          icon="door"
          icon-tone="brand"
        />
        <StatCard
          label="Kamar Terisi"
          :value="String(dashboard.statistik.kamarTerisi)"
          :sub="`${dashboard.statistik.okupansiPersen}% okupansi`"
          sub-tone="ok"
          icon="users"
          icon-tone="ok"
        />
        <StatCard
          label="Belum Bayar"
          :value="`${dashboard.statistik.belumBayarJumlahPenghuni} Penghuni`"
          :sub="rupiah(dashboard.statistik.belumBayarTotal)"
          sub-tone="warn"
          icon="alert"
          icon-tone="warn"
        />
        <StatCard
          label="Pendapatan"
          :value="rupiah(dashboard.statistik.pendapatanBulanIni)"
          :sub="`${dashboard.statistik.pendapatanPersenPerubahan >= 0 ? '+' : ''}${dashboard.statistik.pendapatanPersenPerubahan}% dari bulan lalu`"
          :sub-tone="dashboard.statistik.pendapatanPersenPerubahan >= 0 ? 'ok' : 'danger'"
          icon="wallet"
          icon-tone="gold"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
        <div class="lg:col-span-3">
          <AttentionPanel :data="dashboard.perluPerhatian" />
        </div>
        <div class="lg:col-span-2">
          <RoomStatusDonut :data="dashboard.statusKamar" />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
        <div class="lg:col-span-2">
          <RecentPayments :items="dashboard.pembayaranTerbaru" />
        </div>
        <div class="lg:col-span-3">
          <FinanceChart :data="dashboard.grafikKeuangan" />
        </div>
      </div>

      <RecentActivity :items="dashboard.aktivitasTerbaru" />
    </div>
  </div>
</template>