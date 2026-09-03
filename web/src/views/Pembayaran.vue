<script setup>
import { ref, onMounted } from 'vue'
import NavIcon from '../components/NavIcon.vue'
import PembayaranFormModal from '../components/PembayaranFormModal.vue'

const daftarPembayaran = ref([])
const loading = ref(true)
const errorMsg = ref('')

const modalOpen = ref(false)
const editingPembayaran = ref(null)
const saving = ref(false)
const deletingId = ref(null)
const updatingId = ref(null)

function rupiah(n) {
  return 'Rp' + Number(n).toLocaleString('id-ID')
}

function tanggal(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function labelStatus(status) {
  if (status === 'lunas') return 'Lunas'
  if (status === 'terlambat') return 'Terlambat'
  return 'Belum Dibayar'
}

function kelasStatus(status) {
  if (status === 'lunas') return 'bg-emerald-100 text-emerald-700'
  if (status === 'terlambat') return 'bg-danger-100 text-danger-600'
  return 'bg-amber-100 text-amber-700'
}

async function muatPembayaran() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await fetch('/api/pembayaran')
    if (!res.ok) throw new Error('Gagal memuat data pembayaran')
    const json = await res.json()
    daftarPembayaran.value = json.data
  } catch (err) {
    errorMsg.value = 'Tidak bisa terhubung ke server. Pastikan backend (folder api) sedang berjalan.'
  } finally {
    loading.value = false
  }
}

function bukaTambah() {
  editingPembayaran.value = null
  modalOpen.value = true
}

function bukaEdit(p) {
  editingPembayaran.value = p
  modalOpen.value = true
}

async function simpanPembayaran(form) {
  saving.value = true
  try {
    const isEdit = !!editingPembayaran.value
    const url = isEdit ? `/api/pembayaran/${editingPembayaran.value.id}` : '/api/pembayaran'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (!res.ok) throw new Error('Gagal menyimpan pembayaran')

    modalOpen.value = false
    await muatPembayaran()
  } catch (err) {
    alert('Gagal menyimpan pembayaran. Coba lagi.')
  } finally {
    saving.value = false
  }
}

async function tandaiLunas(p) {
  updatingId.value = p.id
  try {
    const res = await fetch(`/api/pembayaran/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        penghuni_id: p.penghuni_id,
        kamar_id: p.kamar_id,
        jumlah_tagihan: p.jumlah_tagihan,
        jatuh_tempo: p.jatuh_tempo?.slice(0, 10),
        status: 'lunas',
        bukti_pembayaran_url: p.bukti_pembayaran_url,
        tanggal_bayar: new Date().toISOString().slice(0, 10)
      })
    })
    if (!res.ok) throw new Error('Gagal menandai lunas')
    await muatPembayaran()
  } catch (err) {
    alert('Gagal menandai pembayaran sebagai lunas. Coba lagi.')
  } finally {
    updatingId.value = null
  }
}

async function hapusPembayaran(p) {
  if (!confirm(`Hapus data pembayaran ${p.nama_penghuni}? Tindakan ini tidak bisa dibatalkan.`)) return
  deletingId.value = p.id
  try {
    const res = await fetch(`/api/pembayaran/${p.id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Gagal menghapus pembayaran')
    await muatPembayaran()
  } catch (err) {
    alert('Gagal menghapus pembayaran. Coba lagi.')
  } finally {
    deletingId.value = null
  }
}

onMounted(muatPembayaran)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <p class="text-[13.5px] text-ink-500">
        {{ daftarPembayaran.length }} pembayaran tercatat
      </p>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-brand-600"
        @click="bukaTambah"
      >
        <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        Tambah Pembayaran
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
      <button type="button" class="mt-4 text-[13px] font-semibold text-brand-500 hover:text-brand-600" @click="muatPembayaran">
        Coba lagi
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="daftarPembayaran.length === 0" class="bg-white rounded-card border border-ink-100 shadow-card p-10 text-center max-w-md mx-auto mt-6">
      <div class="w-12 h-12 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-4">
        <NavIcon name="wallet" :size="22" />
      </div>
      <p class="text-[14px] font-semibold text-ink-900">Belum ada pembayaran</p>
      <p class="text-[13px] text-ink-500 mt-1.5">Tambahkan tagihan pembayaran pertama untuk mulai mengelola data.</p>
      <button type="button" class="mt-4 text-[13px] font-semibold text-brand-500 hover:text-brand-600" @click="bukaTambah">
        + Tambah Pembayaran
      </button>
    </div>

    <!-- Tabel pembayaran -->
    <div v-else class="bg-white rounded-card border border-ink-100 shadow-card overflow-hidden">
      <table class="w-full text-left">
        <thead>
          <tr class="border-b border-ink-100 bg-ink-50/50">
            <th class="px-4 py-3 text-[12.5px] font-semibold text-ink-500">Penghuni</th>
            <th class="px-4 py-3 text-[12.5px] font-semibold text-ink-500">Kamar</th>
            <th class="px-4 py-3 text-[12.5px] font-semibold text-ink-500">Jumlah Tagihan</th>
            <th class="px-4 py-3 text-[12.5px] font-semibold text-ink-500">Jatuh Tempo</th>
            <th class="px-4 py-3 text-[12.5px] font-semibold text-ink-500">Tgl Bayar</th>
            <th class="px-4 py-3 text-[12.5px] font-semibold text-ink-500">Status</th>
            <th class="px-4 py-3 text-[12.5px] font-semibold text-ink-500 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="p in daftarPembayaran"
            :key="p.id"
            class="border-b border-ink-100 last:border-0 hover:bg-ink-50/40"
          >
            <td class="px-4 py-3 text-[13.5px] font-bold text-ink-900">{{ p.nama_penghuni }}</td>
            <td class="px-4 py-3 text-[13px] text-ink-700">{{ p.nomor_kamar }}</td>
            <td class="px-4 py-3 text-[13px] text-ink-700">{{ rupiah(p.jumlah_tagihan) }}</td>
            <td class="px-4 py-3 text-[12.5px] text-ink-500">{{ tanggal(p.jatuh_tempo) }}</td>
            <td class="px-4 py-3 text-[12.5px] text-ink-500">{{ tanggal(p.tanggal_bayar) }}</td>
            <td class="px-4 py-3">
              <span class="px-2.5 py-1 rounded-full text-[11.5px] font-semibold" :class="kelasStatus(p.status)">
                {{ labelStatus(p.status) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <button
                  v-if="p.status !== 'lunas'"
                  type="button"
                  class="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                  :disabled="updatingId === p.id"
                  @click="tandaiLunas(p)"
                >
                  {{ updatingId === p.id ? 'Menyimpan...' : 'Tandai Lunas' }}
                </button>
                <button
                  type="button"
                  class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink-100 text-ink-500"
                  aria-label="Ubah pembayaran"
                  @click="bukaEdit(p)"
                >
                  <svg viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5">
                    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-danger-100 text-ink-500 hover:text-danger-600 disabled:opacity-50"
                  aria-label="Hapus pembayaran"
                  :disabled="deletingId === p.id"
                  @click="hapusPembayaran(p)"
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

    <PembayaranFormModal
      :open="modalOpen"
      :editing="editingPembayaran"
      :saving="saving"
      @close="modalOpen = false"
      @submit="simpanPembayaran"
    />
  </div>
</template>