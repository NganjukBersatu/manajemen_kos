<script setup>
import { reactive, watch, ref, onMounted } from 'vue'
import NavIcon from './NavIcon.vue'

const props = defineProps({
  open: Boolean,
  editing: { type: Object, default: null },
  saving: Boolean
})
const emit = defineEmits(['close', 'submit'])

const daftarKamar = ref([])

const form = reactive({
  kamar_id: '',
  nama: '',
  no_hp: '',
  tanggal_masuk: '',
  tanggal_keluar: '',
  harga_sewa: '',
  status: 'aktif',
  username: '',
  password: ''
})

async function muatKamar() {
  try {
    const res = await fetch('/api/kamar')
    const json = await res.json()
    daftarKamar.value = json.data
  } catch (err) {
    daftarKamar.value = []
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      form.kamar_id = props.editing?.kamar_id || ''
      form.nama = props.editing?.nama || ''
      form.no_hp = props.editing?.no_hp || ''
      form.tanggal_masuk = props.editing?.tanggal_masuk?.slice(0, 10) || ''
      form.tanggal_keluar = props.editing?.tanggal_keluar?.slice(0, 10) || ''
      form.harga_sewa = props.editing?.harga_sewa || ''
      form.status = props.editing?.status || 'aktif'
      form.username = props.editing?.username || ''
      form.password = '' // selalu kosong saat buka form, isi hanya jika mau ganti password
      muatKamar()
    }
  }
)

function handleSubmit() {
  if (!form.nama || !form.kamar_id || !form.tanggal_masuk || !form.harga_sewa) return
  // Saat tambah penghuni baru, username & password wajib diisi
  if (!props.editing && (!form.username || !form.password)) return

  const payload = {
    ...form,
    kamar_id: Number(form.kamar_id),
    harga_sewa: Number(form.harga_sewa),
    tanggal_keluar: form.tanggal_keluar || null
  }

  // Saat edit, jangan kirim field password kalau dikosongkan (biar password lama tidak ketimpa kosong)
  if (props.editing && !form.password) {
    delete payload.password
  }

  emit('submit', payload)
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div class="absolute inset-0 bg-black/40" @click="emit('close')" />

    <div class="relative bg-white rounded-card shadow-card w-full max-w-md p-5 lg:p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-[16px] font-semibold text-ink-900">
          {{ editing ? 'Ubah Penghuni' : 'Tambah Penghuni' }}
        </h2>
        <button type="button" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink-100 text-ink-500" @click="emit('close')">
          <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Nama Penghuni</label>
          <input
            v-model="form.nama"
            type="text"
            placeholder="Nama lengkap"
            required
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Nomor HP</label>
          <input
            v-model="form.no_hp"
            type="text"
            placeholder="08xxxxxxxxxx"
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Kamar</label>
          <select
            v-model="form.kamar_id"
            required
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none bg-white"
          >
            <option value="" disabled>Pilih kamar</option>
            <option v-for="k in daftarKamar" :key="k.id" :value="k.id">
              {{ k.nomor_kamar }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Tanggal Masuk</label>
            <input
              v-model="form.tanggal_masuk"
              type="date"
              required
              class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Tanggal Keluar</label>
            <input
              v-model="form.tanggal_keluar"
              type="date"
              class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Harga Sewa / bulan</label>
          <input
            v-model="form.harga_sewa"
            type="number"
            min="0"
            placeholder="750000"
            required
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Status</label>
          <select
            v-model="form.status"
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none bg-white"
          >
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>

        <div class="pt-2 border-t border-ink-100">
          <p class="text-[12.5px] font-semibold text-ink-500 uppercase tracking-wide mb-3 mt-3">
            Akun Login Penghuni
          </p>
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Username</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="username untuk login"
            :required="!editing"
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">
            Password
            <span v-if="editing" class="text-ink-400 font-normal">(kosongkan jika tidak diubah)</span>
          </label>
          <input
            v-model="form.password"
            type="password"
            placeholder="Password login"
            :required="!editing"
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div class="flex gap-3 pt-2">
          <button
            type="button"
            class="flex-1 rounded-lg border border-ink-100 py-2.5 text-[13.5px] font-semibold text-ink-700 hover:bg-ink-100/60"
            @click="emit('close')"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="flex-1 rounded-lg bg-brand-500 py-2.5 text-[13.5px] font-semibold text-white hover:bg-brand-600 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <NavIcon v-if="saving" name="gear" :size="14" class="animate-spin" />
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>