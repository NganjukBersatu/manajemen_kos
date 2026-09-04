<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''
  if (!username.value || !password.value) return

  loading.value = true
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    const json = await res.json()

    if (!res.ok) {
      errorMsg.value = json.message || 'Username atau password salah'
      return
    }

    if (json.role === 'penghuni') {
      // Simpan token & data penghuni terpisah dari akun pemilik
      localStorage.setItem('penghuni_token', json.token)
      localStorage.setItem('penghuni_user', JSON.stringify(json.data))
      router.push('/penghuni/dashboard')
    } else {
      // Default: pemilik
      localStorage.setItem('kos_user', JSON.stringify({ ...json.data, token: json.token }))
      router.push('/')
    }
  } catch (err) {
    errorMsg.value = 'Tidak bisa terhubung ke server. Pastikan backend sedang berjalan.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-cream px-4">
    <div class="w-full max-w-sm bg-white rounded-card shadow-card p-6 lg:p-7">
      <div class="flex flex-col items-center mb-6">
        <div class="w-10 h-10 rounded-md bg-gold-500 flex items-center justify-center text-brand-700 font-bold text-base mb-3">
          K
        </div>
        <h1 class="text-[18px] font-semibold text-ink-900">Kelola Kos</h1>
        <p class="text-[13px] text-ink-500 mt-1">Masuk sebagai Pemilik atau Penghuni</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Username</label>
          <input
            v-model="username"
            type="text"
            placeholder="Email pemilik atau username penghuni"
            required
            autocomplete="username"
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Password</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              required
              autocomplete="current-password"
              class="w-full rounded-lg border border-ink-100 pl-3 pr-10 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
            />
            <button
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-ink-400 hover:text-ink-600"
              :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
              tabindex="-1"
              @click="showPassword = !showPassword"
            >
              <!-- Eye (visible) -->
              <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" class="w-4.5 h-4.5">
                <path
                  d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z"
                  stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"
                />
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7" />
              </svg>
              <!-- Eye off (hidden) -->
              <svg v-else viewBox="0 0 24 24" fill="none" class="w-4.5 h-4.5">
                <path
                  d="M3 3l18 18M10.6 10.6a3 3 0 004.24 4.24M6.7 6.7C4.2 8.3 2.5 12 2.5 12s3.5 7 10.5 7c1.9 0 3.5-.4 4.8-1.06M17.4 15.6c1.9-1.4 3.1-3.6 3.1-3.6s-3.5-7-10.5-7c-.6 0-1.16.05-1.7.14"
                  stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <p v-if="errorMsg" class="text-[13px] text-danger-600">{{ errorMsg }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-lg bg-brand-500 py-2.5 text-[13.5px] font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {{ loading ? 'Memproses...' : 'Masuk' }}
        </button>
      </form>
    </div>
  </div>
</template>