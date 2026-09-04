<script setup>
import { reactive, ref, onMounted } from 'vue'
import NavIcon from '../components/NavIcon.vue'

const kosUser = ref(JSON.parse(localStorage.getItem('kos_user') || 'null'))

const profilForm = reactive({
  name: '',
  email: ''
})
const savingProfil = ref(false)
const profilMsg = ref('')
const profilErr = ref('')

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const savingPassword = ref(false)
const passwordMsg = ref('')
const passwordErr = ref('')

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

onMounted(() => {
  if (kosUser.value) {
    profilForm.name = kosUser.value.name || ''
    profilForm.email = kosUser.value.email || ''
  }
})

async function simpanProfil() {
  profilMsg.value = ''
  profilErr.value = ''
  if (!profilForm.name || !profilForm.email) return

  savingProfil.value = true
  try {
    const res = await fetch('/api/auth/profil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: kosUser.value.id,
        name: profilForm.name,
        email: profilForm.email
      })
    })
    const json = await res.json()

    if (!res.ok) {
      profilErr.value = json.message || 'Gagal memperbarui profil'
      return
    }

    // Update data di localStorage biar konsisten di seluruh app
    const updated = { ...kosUser.value, name: json.data.name, email: json.data.email }
    localStorage.setItem('kos_user', JSON.stringify(updated))
    kosUser.value = updated

    profilMsg.value = 'Profil berhasil diperbarui'
  } catch (err) {
    profilErr.value = 'Tidak bisa terhubung ke server'
  } finally {
    savingProfil.value = false
  }
}

async function simpanPassword() {
  passwordMsg.value = ''
  passwordErr.value = ''

  if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) return

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordErr.value = 'Konfirmasi password baru tidak cocok'
    return
  }
  if (passwordForm.newPassword.length < 6) {
    passwordErr.value = 'Password baru minimal 6 karakter'
    return
  }

  savingPassword.value = true
  try {
    const res = await fetch('/api/auth/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: kosUser.value.id,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
    })
    const json = await res.json()

    if (!res.ok) {
      passwordErr.value = json.message || 'Gagal memperbarui password'
      return
    }

    passwordMsg.value = 'Password berhasil diperbarui'
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (err) {
    passwordErr.value = 'Tidak bisa terhubung ke server'
  } finally {
    savingPassword.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl space-y-6">
    <!-- Profil Pemilik -->
    <div class="bg-white rounded-card border border-ink-100 shadow-card p-5 lg:p-6">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-9 h-9 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center">
          <NavIcon name="user" :size="18" />
        </div>
        <div>
          <h2 class="text-[15px] font-semibold text-ink-900">Profil Pemilik</h2>
          <p class="text-[12.5px] text-ink-500">Nama dan email digunakan sebagai username login</p>
        </div>
      </div>

      <form class="space-y-4" @submit.prevent="simpanProfil">
        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Nama</label>
          <input
            v-model="profilForm.name"
            type="text"
            required
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Email (Username Login)</label>
          <input
            v-model="profilForm.email"
            type="email"
            required
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <p v-if="profilMsg" class="text-[13px] text-emerald-600">{{ profilMsg }}</p>
        <p v-if="profilErr" class="text-[13px] text-danger-600">{{ profilErr }}</p>

        <button
          type="submit"
          :disabled="savingProfil"
          class="rounded-lg bg-brand-500 px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {{ savingProfil ? 'Menyimpan...' : 'Simpan Profil' }}
        </button>
      </form>
    </div>

    <!-- Ubah Password -->
    <div class="bg-white rounded-card border border-ink-100 shadow-card p-5 lg:p-6">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-9 h-9 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center">
          <NavIcon name="lock" :size="18" />
        </div>
        <div>
          <h2 class="text-[15px] font-semibold text-ink-900">Ubah Password</h2>
          <p class="text-[12.5px] text-ink-500">Masukkan password lama untuk konfirmasi</p>
        </div>
      </div>

      <form class="space-y-4" @submit.prevent="simpanPassword">
        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Password Saat Ini</label>
          <div class="relative">
            <input
              v-model="passwordForm.currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              class="w-full rounded-lg border border-ink-100 pl-3 pr-10 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
            />
            <button
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-ink-400 hover:text-ink-600"
              tabindex="-1"
              @click="showCurrentPassword = !showCurrentPassword"
            >
              <svg v-if="!showCurrentPassword" viewBox="0 0 24 24" fill="none" class="w-4.5 h-4.5">
                <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" class="w-4.5 h-4.5">
                <path d="M3 3l18 18M10.6 10.6a3 3 0 004.24 4.24M6.7 6.7C4.2 8.3 2.5 12 2.5 12s3.5 7 10.5 7c1.9 0 3.5-.4 4.8-1.06M17.4 15.6c1.9-1.4 3.1-3.6 3.1-3.6s-3.5-7-10.5-7c-.6 0-1.16.05-1.7.14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Password Baru</label>
          <div class="relative">
            <input
              v-model="passwordForm.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              class="w-full rounded-lg border border-ink-100 pl-3 pr-10 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
            />
            <button
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-ink-400 hover:text-ink-600"
              tabindex="-1"
              @click="showNewPassword = !showNewPassword"
            >
              <svg v-if="!showNewPassword" viewBox="0 0 24 24" fill="none" class="w-4.5 h-4.5">
                <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" class="w-4.5 h-4.5">
                <path d="M3 3l18 18M10.6 10.6a3 3 0 004.24 4.24M6.7 6.7C4.2 8.3 2.5 12 2.5 12s3.5 7 10.5 7c1.9 0 3.5-.4 4.8-1.06M17.4 15.6c1.9-1.4 3.1-3.6 3.1-3.6s-3.5-7-10.5-7c-.6 0-1.16.05-1.7.14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
          <p class="text-[11.5px] text-ink-400 mt-1">Minimal 6 karakter</p>
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Konfirmasi Password Baru</label>
          <div class="relative">
            <input
              v-model="passwordForm.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              class="w-full rounded-lg border border-ink-100 pl-3 pr-10 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
            />
            <button
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-ink-400 hover:text-ink-600"
              tabindex="-1"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <svg v-if="!showConfirmPassword" viewBox="0 0 24 24" fill="none" class="w-4.5 h-4.5">
                <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" class="w-4.5 h-4.5">
                <path d="M3 3l18 18M10.6 10.6a3 3 0 004.24 4.24M6.7 6.7C4.2 8.3 2.5 12 2.5 12s3.5 7 10.5 7c1.9 0 3.5-.4 4.8-1.06M17.4 15.6c1.9-1.4 3.1-3.6 3.1-3.6s-3.5-7-10.5-7c-.6 0-1.16.05-1.7.14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <p v-if="passwordMsg" class="text-[13px] text-emerald-600">{{ passwordMsg }}</p>
        <p v-if="passwordErr" class="text-[13px] text-danger-600">{{ passwordErr }}</p>

        <button
          type="submit"
          :disabled="savingPassword"
          class="rounded-lg bg-brand-500 px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {{ savingPassword ? 'Menyimpan...' : 'Ubah Password' }}
        </button>
      </form>
    </div>
  </div>
</template>