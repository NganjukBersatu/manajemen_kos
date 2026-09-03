import { Router } from 'express'

const router = Router()

// TODO: hubungkan ke database saat tabel "pembayaran" sudah disiapkan.
// Lihat catatan struktur data di README backend (folder /api).
// Data: penghuni, kamar, tagihan, jatuh tempo, status, bukti pembayaran.

router.get('/', (req, res) => {
  res.json({ data: [], message: 'Belum terhubung ke database — masih tahap tampilan (V1).' })
})

export default router
