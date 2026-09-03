import { Router } from 'express'

const router = Router()

// TODO: hubungkan ke database saat tabel "pengeluaran" sudah disiapkan.
// Lihat catatan struktur data di README backend (folder /api).
// Data: listrik, air, internet, maintenance, kebersihan, gaji, lainnya.

router.get('/', (req, res) => {
  res.json({ data: [], message: 'Belum terhubung ke database — masih tahap tampilan (V1).' })
})

export default router
