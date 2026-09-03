import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

// Pool koneksi ke database "manajemen_kos".
// Semua nilai diambil dari file .env (lihat .env.example untuk contohnya).
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'manajemen_kos',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || ''
})

pool.on('error', (err) => {
  console.error('Koneksi database bermasalah:', err.message)
})

// Cek koneksi sekali saat server pertama kali jalan.
export async function testConnection() {
  try {
    await pool.query('SELECT 1')
    console.log('✅ Terhubung ke database PostgreSQL (manajemen_kos)')
  } catch (err) {
    console.error('❌ Gagal terhubung ke database:', err.message)
    console.error('   Cek apakah PostgreSQL menyala dan isian .env sudah benar.')
  }
}
