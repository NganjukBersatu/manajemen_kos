<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
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

    localStorage.setItem('kos_user', JSON.stringify(json.data))
    router.push('/')
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
        <p class="text-[13px] text-ink-500 mt-1">Masuk ke dashboard kamu</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Username</label>
          <input
            v-model="username"
            type="text"
            placeholder="owner@kos.com"
            required
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            class="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-[13.5px] text-ink-900 focus:border-brand-400 focus:outline-none"
          />
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