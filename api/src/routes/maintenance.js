import { Router } from 'express'

const router = Router()

// TODO: hubungkan ke database saat tabel "maintenance" sudah disiapkan.
// Lihat catatan struktur data di README backend (folder /api).
// Data: kamar, penghuni, masalah, tanggal laporan, prioritas, status, biaya, catatan.

router.get('/', (req, res) => {
  res.json({ data: [], message: 'Belum terhubung ke database — masih tahap tampilan (V1).' })
})

export default router
