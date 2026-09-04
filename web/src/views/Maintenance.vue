<script setup>
import { ref, computed, onMounted } from 'vue'
import NavIcon from '../components/NavIcon.vue'
import MaintenanceFormModal from '../components/MaintenanceFormModal.vue'

const daftar = ref([])
const loading = ref(true)
const errorMsg = ref('')

const modalOpen = ref(false)
const editingItem = ref(null)
const saving = ref(false)
const deletingId = ref(null)

const searchQuery = ref('')

const statusLabel = {
  masuk: 'Masuk',
  diproses: 'Diproses',
  diperbaiki: 'Diperbaiki',
  selesai: 'Selesai'
}
const statusTone = {
  masuk: 'bg-amber-100 text-amber-700',
  diproses: 'bg-brand-50 text-brand-500',
  diperbaiki: 'bg-warn-100 text-warn-600',
  selesai: 'bg-ok-100 text-ok-600'
}

const prioritasLabel = {
  rendah: 'Rendah',
  sedang: 'Sedang',
  tinggi: 'Tinggi'
}
const prioritasTone = {
  rendah: 'bg-ink-100 text-ink-600',
  sedang: 'bg-amber-100 text-amber-700',
  tinggi: 'bg-danger-100 text-danger-600'
}

const daftarTersaring = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return daftar.value

  return daftar.value.filter((item) => {
    return (
      item.nomor_kamar?.toLowerCase().includes(q) ||
      item.masalah?.toLowerCase().includes(q) ||
      item.catatan?.toLowerCase().includes(q) ||
      (statusLabel[item.status] || '').toLowerCase().includes(q) ||
      (prioritasLabel[item.prioritas] || '').toLowerCase().includes(q)
    )
  })
})

function rupiah(n) {
  if (n === null || n === undefined) return '-'
  return 'Rp' + Number(n).toLocaleString('id-ID')
}

function formatTanggal(t) {
  if (!t) return '-'
  return new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function muatData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await fetch('/api/maintenance')
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
    const url = isEdit ? `/api/maintenance/${editingItem.value.id}` : '/api/maintenance'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (!res.ok) throw new Error('Gagal menyimpan')

    modalOpen.value = false
    await muatData()
  } catch (err) {
    alert('Gagal menyimpan laporan maintenance. Coba lagi.')
  } finally {
    saving.value = false
  }
}

async function hapus(item) {
  if (!confirm(`Hapus laporan "${item.masalah}" untuk kamar ${item.nomor_kamar}?`)) return
  deletingId.value = item.id
  try {
    const res = await fetch(`/api/maintenance/${item.id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Gagal menghapus')
    await muatData()
  } catch (err) {
    alert('Gagal menghapus laporan. Coba lagi.')
  } finally {
    deletingId.value = null
  }
}

onMounted(muatData)
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-3 mb-5 flex-wrap">
      <p class="text-[13.5px] text-ink-500 whitespace-nowrap">
        {{ daftarTersaring.length }} dari {{ daftar.length }} laporan
      </p>

      <div class="flex items-center gap-3">
        <div class="relative">
          <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari kamar, masalah, status..."
            class="w-64 rounded-lg border border-ink-100 pl-9 pr-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <button
          type="button"
          class="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-brand-600 whitespace-nowrap"
          @click="bukaTambah"
        >
          <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          Tambah Laporan
        </button>
      </div>
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

    <!-- Empty: belum ada laporan sama sekali -->
    <div v-else-if="daftar.length === 0" class="bg-white rounded-card border border-ink-100 shadow-card p-10 text-center max-w-md mx-auto mt-6">
      <div class="w-12 h-12 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-4">
        <NavIcon name="wrench" :size="22" />
      </div>
      <p class="text-[14px] font-semibold text-ink-900">Belum ada laporan maintenance</p>
      <p class="text-[13px] text-ink-500 mt-1.5">Kelola laporan kerusakan dari kamar mulai dari masuk, diproses, diperbaiki, hingga selesai.</p>
      <button type="button" class="mt-4 text-[13px] font-semibold text-brand-500 hover:text-brand-600" @click="bukaTambah">
        + Tambah Laporan
      </button>
    </div>

    <!-- Empty: tidak ada hasil pencarian -->
    <div v-else-if="daftarTersaring.length === 0" class="bg-white rounded-card border border-ink-100 shadow-card p-10 text-center max-w-md mx-auto mt-6">
      <div class="w-12 h-12 rounded-xl bg-ink-100 text-ink-500 flex items-center justify-center mx-auto mb-4">
        <NavIcon name="alert" :size="22" />
      </div>
      <p class="text-[14px] font-semibold text-ink-900">Tidak ada laporan yang cocok</p>
      <p class="text-[13px] text-ink-500 mt-1.5">Coba kata kunci lain, atau hapus pencarian.</p>
      <button type="button" class="mt-4 text-[13px] font-semibold text-brand-500 hover:text-brand-600" @click="searchQuery = ''">
        Hapus pencarian
      </button>
    </div>

    <!-- Tabel -->
    <div v-else class="bg-white rounded-card border border-ink-100 shadow-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-[13.5px] min-w-[820px]">
          <thead>
            <tr class="text-left text-ink-500 text-[12px] border-b border-ink-100 bg-ink-100/30">
              <th class="py-3 px-4 font-medium">Kamar</th>
              <th class="py-3 px-4 font-medium">Masalah</th>
              <th class="py-3 px-4 font-medium">Tgl Lapor</th>
              <th class="py-3 px-4 font-medium">Prioritas</th>
              <th class="py-3 px-4 font-medium text-right">Biaya</th>
              <th class="py-3 px-4 font-medium">Status</th>
              <th class="py-3 px-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in daftarTersaring"
              :key="item.id"
              class="border-b border-ink-100 last:border-0 hover:bg-ink-100/20"
            >
              <td class="py-3 px-4 font-medium text-ink-900 whitespace-nowrap">{{ item.nomor_kamar }}</td>
              <td class="py-3 px-4 text-ink-700 max-w-[220px] truncate">{{ item.masalah || '-' }}</td>
              <td class="py-3 px-4 text-ink-500 whitespace-nowrap">{{ formatTanggal(item.tanggal_laporan) }}</td>
              <td class="py-3 px-4">
                <span
                  class="inline-block px-2 py-1 rounded-md text-[11.5px] font-semibold"
                  :class="prioritasTone[item.prioritas] || 'bg-ink-100 text-ink-600'"
                >
                  {{ prioritasLabel[item.prioritas] || item.prioritas || '-' }}
                </span>
              </td>
              <td class="py-3 px-4 text-right text-ink-700 whitespace-nowrap">{{ rupiah(item.biaya) }}</td>
              <td class="py-3 px-4">
                <span class="inline-block px-2 py-1 rounded-md text-[11.5px] font-semibold" :class="statusTone[item.status]">
                  {{ statusLabel[item.status] || item.status }}
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center justify-end gap-1">
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

    <MaintenanceFormModal
      :open="modalOpen"
      :editing="editingItem"
      :saving="saving"
      @close="modalOpen = false"
      @submit="simpan"
    />
  </div>
</template>