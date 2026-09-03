<script setup>
import { computed } from 'vue'
import { grafikKeuangan } from '../data/dummy.js'

const W = 560
const H = 200
const PAD_L = 8
const PAD_R = 8
const PAD_T = 12
const PAD_B = 24

const maxVal = computed(() =>
  Math.max(...grafikKeuangan.pendapatan, ...grafikKeuangan.pengeluaran) * 1.1
)

function points(series) {
  const n = series.length
  const usableW = W - PAD_L - PAD_R
  const usableH = H - PAD_T - PAD_B
  return series
    .map((v, i) => {
      const x = PAD_L + (usableW * i) / (n - 1)
      const y = PAD_T + usableH - (usableH * v) / maxVal.value
      return `${x},${y}`
    })
    .join(' ')
}

const pendapatanPts = computed(() => points(grafikKeuangan.pendapatan))
const pengeluaranPts = computed(() => points(grafikKeuangan.pengeluaran))

const keuntunganBulanIni = computed(() => {
  const n = grafikKeuangan.pendapatan.length - 1
  return grafikKeuangan.pendapatan[n] - grafikKeuangan.pengeluaran[n]
})

function rupiahSingkat(n) {
  if (n >= 1000000) return 'Rp' + (n / 1000000).toFixed(1).replace('.0', '') + 'jt'
  return 'Rp' + n.toLocaleString('id-ID')
}
</script>

<template>
  <section class="bg-white rounded-card border border-ink-100 shadow-card p-4 lg:p-5">
    <div class="flex items-start justify-between mb-1 flex-wrap gap-2">
      <div>
        <h2 class="text-[15px] font-semibold text-ink-900">Grafik Keuangan</h2>
        <p class="text-[12.5px] text-ink-500">6 bulan terakhir</p>
      </div>
      <div class="flex items-center gap-4 text-[12.5px]">
        <span class="flex items-center gap-1.5 text-ink-700">
          <span class="w-2.5 h-2.5 rounded-full bg-brand-500" /> Pendapatan
        </span>
        <span class="flex items-center gap-1.5 text-ink-700">
          <span class="w-2.5 h-2.5 rounded-full bg-gold-500" /> Pengeluaran
        </span>
      </div>
    </div>

    <p class="text-[12.5px] text-ok-600 font-medium mb-2">
      Keuntungan bulan ini {{ rupiahSingkat(keuntunganBulanIni) }}
    </p>

    <svg :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto">
      <line
        v-for="i in 3" :key="i"
        :x1="PAD_L" :x2="W - PAD_R"
        :y1="PAD_T + ((H - PAD_T - PAD_B) / 3) * i"
        :y2="PAD_T + ((H - PAD_T - PAD_B) / 3) * i"
        stroke="#E4E9E6" stroke-width="1"
      />

      <polyline :points="pengeluaranPts" fill="none" stroke="#D9A448" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
      <polyline :points="pendapatanPts" fill="none" stroke="#1F5F5B" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />

      <g v-for="(bulan, i) in grafikKeuangan.bulan" :key="bulan">
        <text
          :x="PAD_L + ((W - PAD_L - PAD_R) * i) / (grafikKeuangan.bulan.length - 1)"
          :y="H - 4"
          text-anchor="middle"
          font-size="10.5"
          fill="#647A75"
        >{{ bulan }}</text>
      </g>
    </svg>
  </section>
</template>
