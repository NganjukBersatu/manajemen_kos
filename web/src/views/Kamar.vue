<script setup>
import { ref, onMounted } from 'vue'
import NavIcon from '../components/NavIcon.vue'
import StatusBadge from '../components/StatusBadge.vue'
import KamarFormModal from '../components/KamarFormModal.vue'

const daftarKamar = ref([])
const loading = ref(true)
const errorMsg = ref('')

const modalOpen = ref(false)
const editingKamar = ref(null)
const saving = ref(false)

const deletingId = ref(null)

function rupiah(n) {
  return 'Rp' + Number(n).toLocaleString('id-ID')
}

async function muatKamar() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await fetch('/api/kamar')
    if (!res.ok) throw new Error('Gagal memuat data kamar')
    const json = await res.json()
    daftarKamar.value = json.data
  } catch (err) {
    errorMsg.value = 'Tidak bisa terhubung ke server. Pastikan backend (folder api) sedang berjalan.'
  } finally {
    loading.value = false
  }
}

function bukaTambah() {
  editingKamar.value = null
  modalOpen.value = true
}

function bukaEdit(kamar) {
  editingKamar.value = kamar
  modalOpen.value = true
}

async function simpanKamar(form) {
  saving.value = true
  try {
    const isEdit = !!editingKamar.value
    const url = isEdit ? `/api/kamar/${editingKamar.value.id}` : '/api/kamar'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (!res.ok) throw new Error('Gagal menyimpan kamar')

    modalOpen.value = false
    await muatKamar()
  } catch (err) {
    alert('Gagal menyimpan kamar. Coba lagi.')
  } finally {
    saving.value = false
  }
}

async function hapusKamar(kamar) {
  if (!confirm(`Hapus kamar ${kamar.nomor_kamar}? Tindakan ini tidak bisa dibatalkan.`)) return
  deletingId.value = kamar.id
  try {
    const res = await fetch(`/api/kamar/${kamar.id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Gagal menghapus kamar')
    await muatKamar()
  } catch (err) {
    alert('Gagal menghapus kamar. Coba lagi.')
  } finally {
    deletingId.value = null
  }
}

onMounted(muatKamar)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <p class="text-[13.5px] text-ink-500">
        {{ daftarKamar.length }} kamar terdaftar
      </p>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-brand-600"
        @click="bukaTambah"
      >
        <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        Tambah Kamar
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-card border border-ink-100 shadow-card p-6">
      <div v-for="i in 4" :key="i" class="h-10 bg-ink-100/60 rounded-lg animate-pulse mb-2 last:mb-0" />
    </div>

    <!-- Error -->
    <div v-else-if="errorMsg" class="bg-white rounded-card border border-danger-100 shadow-card p-8 text-center max-w-md mx-auto mt-6">
      <div class="w-12 h-12 rounded-xl bg-danger-100 text-danger-600 flex items-center justify-center mx-auto mb-4">
        <NavIcon name="alert" :size="22" />
      </div>
      <p class="text-[13.5px] text-ink-700">{{ errorMsg }}</p>
      <button type="button" class="mt-4 text-[13px] font-semibold text-brand-500 hover:text-brand-600" @click="muatKamar">
        Coba lagi
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="daftarKamar.length === 0" class="bg-white rounded-card border border-ink-100 shadow-card p-10 text-center max-w-md mx-auto mt-6">
      <div class="w-12 h-12 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-4">
        <NavIcon name="door" :size="22" />
      </div>
      <p class="text-[14px] font-semibold text-ink-900">Belum ada kamar</p>
      <p class="text-[13px] text-ink-500 mt-1.5">Tambahkan kamar pertama untuk mulai mengelola kos kamu.</p>
      <button type="button" class="mt-4 text-[13px] font-semibold text-brand-500 hover:text-brand-600" @click="bukaTambah">
        + Tambah Kamar
      </button>
    </div>

    <!-- Tabel kamar -->
    <div v-else class="bg-white rounded-card border border-ink-100 shadow-card overflow-hidden">
      <table class="w-full text-left">
        <thead>
          <tr class="border-b border-ink-100 bg-ink-50/50">
            <th class="px-4 py-3 text-[12.5px] font-semibold text-ink-500">Nomor Kamar</th>
            <th class="px-4 py-3 text-[12.5px] font-semibold text-ink-500">Harga / bulan</th>
            <th class="px-4 py-3 text-[12.5px] font-semibold text-ink-500">Status</th>
            <th class="px-4 py-3 text-[12.5px] font-semibold text-ink-500">Fasilitas</th>
            <th class="px-4 py-3 text-[12.5px] font-semibold text-ink-500">Penghuni</th>
            <th class="px-4 py-3 text-[12.5px] font-semibold text-ink-500 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="kamar in daftarKamar"
            :key="kamar.id"
            class="border-b border-ink-100 last:border-0 hover:bg-ink-50/40"
          >
            <td class="px-4 py-3 text-[13.5px] font-bold text-ink-900">{{ kamar.nomor_kamar }}</td>
            <td class="px-4 py-3 text-[13px] text-ink-700">{{ rupiah(kamar.harga) }}</td>
            <td class="px-4 py-3">
              <StatusBadge :status="kamar.status" />
            </td>
            <td class="px-4 py-3 text-[12.5px] text-ink-500 max-w-[220px] truncate">
              {{ kamar.fasilitas || '-' }}
            </td>
            <td class="px-4 py-3 text-[12.5px]">
              <span v-if="kamar.nama_penghuni" class="font-medium text-ink-700">{{ kamar.nama_penghuni }}</span>
              <span v-else class="text-ink-300">Belum ada penghuni</span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <button
                  type="button"
                  class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink-100 text-ink-500"
                  aria-label="Ubah kamar"
                  @click="bukaEdit(kamar)"
                >
                  <svg viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5">
                    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-danger-100 text-ink-500 hover:text-danger-600 disabled:opacity-50"
                  aria-label="Hapus kamar"
                  :disabled="deletingId === kamar.id"
                  @click="hapusKamar(kamar)"
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

    <KamarFormModal
      :open="modalOpen"
      :editing="editingKamar"
      :saving="saving"
      @close="modalOpen = false"
      @submit="simpanKamar"
    />
  </div>
</template>