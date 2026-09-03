import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      // Saat backend (folder /api) sudah dijalankan, aktifkan proxy ini
      // '/api': 'http://localhost:4000'
    }
  }
})
