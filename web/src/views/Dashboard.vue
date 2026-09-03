<script setup>
import StatCard from '../components/StatCard.vue'
import AttentionPanel from '../components/AttentionPanel.vue'
import RoomStatusDonut from '../components/RoomStatusDonut.vue'
import RecentPayments from '../components/RecentPayments.vue'
import FinanceChart from '../components/FinanceChart.vue'
import RecentActivity from '../components/RecentActivity.vue'
import { statistik } from '../data/dummy.js'

function rupiah(n) {
  return 'Rp' + n.toLocaleString('id-ID')
}
</script>

<template>
  <div class="space-y-5 lg:space-y-6">
    <!-- Statistik -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <StatCard
        label="Total Kamar"
        :value="`${statistik.totalKamar} Kamar`"
        :sub="`${statistik.kamarTerisi} terisi · ${statistik.kamarKosong} kosong`"
        icon="door"
        icon-tone="brand"
      />
      <StatCard
        label="Kamar Terisi"
        :value="String(statistik.kamarTerisi)"
        :sub="`${statistik.okupansiPersen}% okupansi`"
        sub-tone="ok"
        icon="users"
        icon-tone="ok"
      />
      <StatCard
        label="Belum Bayar"
        :value="`${statistik.belumBayarJumlahPenghuni} Penghuni`"
        :sub="rupiah(statistik.belumBayarTotal)"
        sub-tone="warn"
        icon="alert"
        icon-tone="warn"
      />
      <StatCard
        label="Pendapatan"
        :value="rupiah(statistik.pendapatanBulanIni)"
        :sub="`+${statistik.pendapatanPersenPerubahan}% dari bulan lalu`"
        sub-tone="ok"
        icon="wallet"
        icon-tone="gold"
      />
    </div>

    <!-- Perlu Perhatian + Status Kamar -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
      <div class="lg:col-span-3">
        <AttentionPanel />
      </div>
      <div class="lg:col-span-2">
        <RoomStatusDonut />
      </div>
    </div>

    <!-- Pembayaran Terbaru + Grafik Keuangan -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
      <div class="lg:col-span-2">
        <RecentPayments />
      </div>
      <div class="lg:col-span-3">
        <FinanceChart />
      </div>
    </div>

    <!-- Aktivitas Terbaru -->
    <RecentActivity />
  </div>
</template>
