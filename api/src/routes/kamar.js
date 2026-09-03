import { Router } from 'express'

const router = Router()

// TODO: hubungkan ke database saat tabel "kamar" sudah disiapkan.
// Lihat catatan struktur data di README backend (folder /api).
// Data: nomor kamar, harga, status, fasilitas, foto, penghuni.

router.get('/', (req, res) => {
  res.json({ data: [], message: 'Belum terhubung ke database — masih tahap tampilan (V1).' })
})

export default router
