<script setup>
import { pembayaranTerbaru } from '../data/dummy.js'

function rupiah(n) {
  return 'Rp' + n.toLocaleString('id-ID')
}

const statusStyle = {
  Lunas: 'bg-ok-100 text-ok-600',
  'Belum Dibayar': 'bg-warn-100 text-warn-600',
  Terlambat: 'bg-danger-100 text-danger-600'
}
</script>

<template>
  <section class="bg-white rounded-card border border-ink-100 shadow-card p-4 lg:p-5">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-[15px] font-semibold text-ink-900">Pembayaran Terbaru</h2>
      <router-link to="/pembayaran" class="text-[12.5px] font-semibold text-brand-500 hover:text-brand-600">
        Lihat Semua Pembayaran →
      </router-link>
    </div>

    <div class="overflow-x-auto -mx-1">
      <table class="w-full text-[13.5px] min-w-[420px]">
        <thead>
          <tr class="text-left text-ink-500 text-[12px] border-b border-ink-100">
            <th class="pb-2 px-1 font-medium">Penghuni</th>
            <th class="pb-2 px-1 font-medium">Kamar</th>
            <th class="pb-2 px-1 font-medium text-right">Tagihan</th>
            <th class="pb-2 px-1 font-medium text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="p in pembayaranTerbaru"
            :key="p.penghuni + p.kamar"
            class="border-b border-ink-100 last:border-0"
          >
            <td class="py-2.5 px-1 font-medium text-ink-900">{{ p.penghuni }}</td>
            <td class="py-2.5 px-1 text-ink-500">{{ p.kamar }}</td>
            <td class="py-2.5 px-1 text-right text-ink-900">{{ rupiah(p.tagihan) }}</td>
            <td class="py-2.5 px-1 text-right">
              <span
                class="inline-block px-2 py-1 rounded-md text-[11.5px] font-semibold"
                :class="statusStyle[p.status]"
              >
                {{ p.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
