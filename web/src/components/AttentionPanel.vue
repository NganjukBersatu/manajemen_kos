<script setup>
import NavIcon from './NavIcon.vue'

const props = defineProps({
  data: { type: Object, required: true }
})

function rupiah(n) {
  return 'Rp' + Number(n).toLocaleString('id-ID')
}
</script>

<template>
  <section class="bg-white rounded-card border border-ink-100 shadow-card p-4 lg:p-5">
    <div class="flex items-center gap-2 mb-4">
      <div class="w-7 h-7 rounded-lg bg-warn-100 text-warn-600 flex items-center justify-center">
        <NavIcon name="alert" :size="15" />
      </div>
      <h2 class="text-[15px] font-semibold text-ink-900">Perlu Perhatian</h2>
    </div>

    <div class="space-y-3">
      <div class="flex items-start justify-between gap-3 rounded-lg border border-danger-100 bg-danger-100/40 p-3">
        <div>
          <p class="text-[13.5px] font-semibold text-ink-900">
            {{ data.pembayaranBelumLunas.jumlah }} pembayaran belum lunas
          </p>
          <p class="text-[12.5px] text-ink-500 mt-0.5">
            {{ rupiah(data.pembayaranBelumLunas.total) }} belum diterima
          </p>
        </div>
        <router-link to="/pembayaran" class="text-[12.5px] font-semibold text-brand-500 hover:text-brand-600 shrink-0 mt-0.5">
          Lihat
        </router-link>
      </div>

      <div v-if="data.kamarPerluPerbaikan.length" class="rounded-lg border border-warn-100 bg-warn-100/40 p-3">
        <div class="flex items-start justify-between gap-3">
          <p class="text-[13.5px] font-semibold text-ink-900">
            {{ data.kamarPerluPerbaikan.length }} kamar membutuhkan perbaikan
          </p>
          <router-link to="/maintenance" class="text-[12.5px] font-semibold text-brand-500 hover:text-brand-600 shrink-0">
            Lihat
          </router-link>
        </div>
        <ul class="mt-1.5 space-y-0.5">
          <li v-for="k in data.kamarPerluPerbaikan" :key="k.kamar" class="text-[12.5px] text-ink-500">
            <span class="font-medium text-ink-700">{{ k.kamar }}</span> — {{ k.masalah }}
          </li>
        </ul>
      </div>

      <div class="flex items-start justify-between gap-3 rounded-lg border border-ink-100 bg-ink-100/40 p-3">
        <div>
          <p class="text-[13.5px] font-semibold text-ink-900">
            {{ data.kontrakAkanBerakhir.jumlah }} kontrak akan berakhir
          </p>
          <p class="text-[12.5px] text-ink-500 mt-0.5">
            Dalam {{ data.kontrakAkanBerakhir.dalamHari }} hari
          </p>
        </div>
        <router-link to="/penghuni" class="text-[12.5px] font-semibold text-brand-500 hover:text-brand-600 shrink-0 mt-0.5">
          Lihat
        </router-link>
      </div>
    </div>
  </section>
</template>