import { Router } from 'express'

const router = Router()

// TODO: hubungkan ke database saat tabel "laporan" sudah disiapkan.
// Lihat catatan struktur data di README backend (folder /api).
// Agregasi: pendapatan, pengeluaran, keuntungan, okupansi.

router.get('/', (req, res) => {
  res.json({ data: [], message: 'Belum terhubung ke database — masih tahap tampilan (V1).' })
})

export default router
