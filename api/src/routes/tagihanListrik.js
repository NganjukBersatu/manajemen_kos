import { Router } from 'express'

const router = Router()

// TODO: hubungkan ke database saat tabel "tagihanListrik" sudah disiapkan.
// Lihat catatan struktur data di README backend (folder /api).
// Data: periode, meter awal/akhir, pemakaian, tarif, total, jatuh tempo, status.

router.get('/', (req, res) => {
  res.json({ data: [], message: 'Belum terhubung ke database — masih tahap tampilan (V1).' })
})

export default router
