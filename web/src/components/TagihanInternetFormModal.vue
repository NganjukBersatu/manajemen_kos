<script setup>
import { reactive, watch, onMounted, ref } from 'vue'
import NavIcon from './NavIcon.vue'

const props = defineProps({
  open: Boolean,
  editing: { type: Object, default: null },
  saving: Boolean
})
const emit = defineEmits(['close', 'submit'])

const daftarKamar = ref([])

async function muatKamar() {
  try {
    const res = await fetch('/api/kamar')
    const json = await res.json()
    daftarKamar.value = json.data || []
  } catch (err) {
    daftarKamar.value = []
  }
}

function bulanIni() {
  return new Date().toISOString().slice(0, 7) // YYYY-MM
}

const form = reactive({
  kamar_id: '',
  periode: bulanIni(),
  provider: '',
  paket: '',
  tagihan: '',
  jatuh_tempo: '',
  status: 'belum_dibayar'
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      form.kamar_id = props.editing?.kamar_id || ''
      form.periode = props.editing?.periode || bulanIni()
      form.provider = props.editing?.provider || ''
      form.paket = props.editing?.paket || ''
      form.tagihan = props.editing?.tagihan ?? ''
      form.jatuh_tempo = props.editing?.jatuh_tempo?.slice(0, 10) || ''
      form.status = props.editing?.status || 'belum_dibayar'
    }
  }
)

function handleSubmit() {
  if (!form.kamar_id || !form.periode || !form.provider || !form.paket || !form.tagihan || !form.jatuh_tempo) return
  emit('submit', {
    ...form,
    kamar_id: Number(form.kamar_id),
    tagihan: Number(form.tagihan)
  })
}

onMounted(muatKamar)
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 overflow-y-auto">
    <div class="absolute inset-0 bg-black/40" @click="emit('close')" />

    <div class="relative bg-white rounded-card shadow-card w-full max-w-md p-5 lg:p-6 my-auto">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-[16px] font-semibold text-ink-900">
          {{ editing ? 'Ubah Tagihan Internet' : 'Tambah Tagihan Internet' }}
        </h2>
        <button type="button" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink-100 text-ink-500" @click="emit('close')">
          <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Kamar</label>
          <select
            v-model="form.kamar_id"
            :disabled="!!editing"
            required
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none bg-white disabled:bg-ink-100/40 disabled:text-ink-500"
          >
            <option value="" disabled>Pilih kamar</option>
            <option v-for="k in daftarKamar" :key="k.id" :value="k.id">{{ k.nomor_kamar }}</option>
          </select>
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Periode</label>
          <input
            v-model="form.periode"
            type="month"
            required
            :disabled="!!editing"
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none disabled:bg-ink-100/40 disabled:text-ink-500"
          />
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Provider</label>
          <input
            v-model="form.provider"
            type="text"
            placeholder="IndiHome, Biznet, MyRepublic..."
            required
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Paket</label>
          <input
            v-model="form.paket"
            type="text"
            placeholder="20 Mbps"
            required
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Biaya Bulanan (Rp)</label>
          <input
            v-model="form.tagihan"
            type="number"
            min="0"
            required
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Jatuh Tempo</label>
          <input
            v-model="form.jatuh_tempo"
            type="date"
            required
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div v-if="editing">
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Status</label>
          <select
            v-model="form.status"
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none bg-white"
          >
            <option value="belum_dibayar">Belum Dibayar</option>
            <option value="lunas">Lunas</option>
            <option value="terlambat">Terlambat</option>
          </select>
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