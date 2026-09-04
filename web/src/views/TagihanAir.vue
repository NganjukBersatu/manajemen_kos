<script setup>
import { ref, onMounted } from 'vue'
import NavIcon from '../components/NavIcon.vue'
import TagihanAirFormModal from '../components/TagihanAirFormModal.vue'

const daftar = ref([])
const loading = ref(true)
const errorMsg = ref('')

const modalOpen = ref(false)
const editingItem = ref(null)
const saving = ref(false)
const deletingId = ref(null)
const markingId = ref(null)

const statusLabel = {
  lunas: 'Lunas',
  belum_dibayar: 'Belum Dibayar',
  terlambat: 'Terlambat'
}
const statusTone = {
  lunas: 'bg-ok-100 text-ok-600',
  belum_dibayar: 'bg-warn-100 text-warn-600',
  terlambat: 'bg-danger-100 text-danger-600'
}

function rupiah(n) {
  return 'Rp' + Number(n).toLocaleString('id-ID')
}

function formatPeriode(p) {
  const [y, m] = p.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

function formatTanggal(t) {
  return new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function muatData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await fetch('/api/tagihan/air')
    if (!res.ok) throw new Error('Gagal memuat data')
    const json = await res.json()
    daftar.value = json.data
  } catch (err) {
    errorMsg.value = 'Tidak bisa terhubung ke server. Pastikan backend (folder api) sedang berjalan.'
  } finally {
    loading.value = false
  }
}

function bukaTambah() {
  editingItem.value = null
  modalOpen.value = true
}

function bukaEdit(item) {
  editingItem.value = item
  modalOpen.value = true
}

async function simpan(form) {
  saving.value = true
  try {
    const isEdit = !!editingItem.value
    const url = isEdit ? `/api/tagihan/air/${editingItem.value.id}` : '/api/tagihan/air'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Gagal menyimpan')
    }

    modalOpen.value = false
    await muatData()
  } catch (err) {
    alert(err.message || 'Gagal menyimpan tagihan. Coba lagi.')
  } finally {
    saving.value = false
  }
}

async function hapus(item) {
  if (!confirm(`Hapus tagihan air kamar ${item.nomor_kamar} periode ${formatPeriode(item.periode)}?`)) return
  deletingId.value = item.id
  try {
    const res = await fetch(`/api/tagihan/air/${item.id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Gagal menghapus')
    await muatData()
  } catch (err) {
    alert('Gagal menghapus tagihan. Coba lagi.')
  } finally {
    deletingId.value = null
  }
}

async function tandaiLunas(item) {
  if (!confirm(`Tandai tagihan air kamar ${item.nomor_kamar} periode ${formatPeriode(item.periode)} sebagai Lunas?`)) return
  markingId.value = item.id
  try {
    const res = await fetch(`/api/tagihan/air/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'lunas' })
    })
    if (!res.ok) throw new Error('Gagal menandai lunas')
    await muatData()
  } catch (err) {
    alert('Gagal menandai lunas. Coba lagi.')
  } finally {
    markingId.value = null
  }
}

onMounted(muatData)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <p class="text-[13.5px] text-ink-500">{{ daftar.length }} tagihan tercatat</p>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-brand-600"
        @click="bukaTambah"
      >
        <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        Tambah Tagihan
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-card border border-ink-100 shadow-card p-4 space-y-3">
      <div v-for="i in 5" :key="i" class="h-10 bg-ink-100/60 rounded-lg animate-pulse" />
    </div>

    <!-- Error -->
    <div v-else-if="errorMsg" class="bg-white rounded-card border border-danger-100 shadow-card p-8 text-center max-w-md mx-auto mt-6">
      <div class="w-12 h-12 rounded-xl bg-danger-100 text-danger-600 flex items-center justify-center mx-auto mb-4">
        <NavIcon name="alert" :size="22" />
      </div>
      <p class="text-[13.5px] text-ink-700">{{ errorMsg }}</p>
      <button type="button" class="mt-4 text-[13px] font-semibold text-brand-500 hover:text-brand-600" @click="muatData">
        Coba lagi
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="daftar.length === 0" class="bg-white rounded-card border border-ink-100 shadow-card p-10 text-center max-w-md mx-auto mt-6">
      <div class="w-12 h-12 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-4">
        <NavIcon name="drop" :size="22" />
      </div>
      <p class="text-[14px] font-semibold text-ink-900">Belum ada tagihan air</p>
      <p class="text-[13px] text-ink-500 mt-1.5">Catat meter awal & akhir tiap kamar untuk menghitung tagihan air bulanan.</p>
      <button type="button" class="mt-4 text-[13px] font-semibold text-brand-500 hover:text-brand-600" @click="bukaTambah">
        + Tambah Tagihan
      </button>
    </div>

    <!-- Tabel -->
    <div v-else class="bg-white rounded-card border border-ink-100 shadow-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-[13.5px] min-w-[880px]">
          <thead>
            <tr class="text-left text-ink-500 text-[12px] border-b border-ink-100 bg-ink-100/30">
              <th class="py-3 px-4 font-medium">Kamar</th>
              <th class="py-3 px-4 font-medium">Periode</th>
              <th class="py-3 px-4 font-medium text-right">Meter Awal</th>
              <th class="py-3 px-4 font-medium text-right">Meter Akhir</th>
              <th class="py-3 px-4 font-medium text-right">Pemakaian</th>
              <th class="py-3 px-4 font-medium text-right">Total</th>
              <th class="py-3 px-4 font-medium">Jatuh Tempo</th>
              <th class="py-3 px-4 font-medium">Status</th>
              <th class="py-3 px-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in daftar"
              :key="item.id"
              class="border-b border-ink-100 last:border-0 hover:bg-ink-100/20"
            >
              <td class="py-3 px-4 font-medium text-ink-900 whitespace-nowrap">{{ item.nomor_kamar }}</td>
              <td class="py-3 px-4 text-ink-700 whitespace-nowrap">{{ formatPeriode(item.periode) }}</td>
              <td class="py-3 px-4 text-right text-ink-500">{{ item.meter_awal }}</td>
              <td class="py-3 px-4 text-right text-ink-500">{{ item.meter_akhir }}</td>
              <td class="py-3 px-4 text-right text-ink-700">{{ item.pemakaian }} m³</td>
              <td class="py-3 px-4 text-right font-semibold text-ink-900 whitespace-nowrap">{{ rupiah(item.total) }}</td>
              <td class="py-3 px-4 text-ink-700 whitespace-nowrap">{{ formatTanggal(item.jatuh_tempo) }}</td>
              <td class="py-3 px-4">
                <span class="inline-block px-2 py-1 rounded-md text-[11.5px] font-semibold" :class="statusTone[item.status]">
                  {{ statusLabel[item.status] }}
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center justify-end gap-1">
                  <button
                    v-if="item.status !== 'lunas'"
                    type="button"
                    class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ok-100 text-ink-500 hover:text-ok-600 disabled:opacity-50"
                    aria-label="Tandai lunas"
                    title="Tandai Lunas"
                    :disabled="markingId === item.id"
                    @click="tandaiLunas(item)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5">
                      <path d="M4 12l5 5L20 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink-100 text-ink-500"
                    aria-label="Ubah"
                    @click="bukaEdit(item)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5">
                      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-danger-100 text-ink-500 hover:text-danger-600 disabled:opacity-50"
                    aria-label="Hapus"
                    :disabled="deletingId === item.id"
                    @click="hapus(item)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5">
                      <path d="M4 7h16M9 7V4h6v3m-8 0l1 13h8l1-13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <TagihanAirFormModal
      :open="modalOpen"
      :editing="editingItem"
      :saving="saving"
      @close="modalOpen = false"
      @submit="simpan"
    />
  </div>
</template>