import { Router } from 'express'

const router = Router()

// TODO: hubungkan ke database saat tabel "penghuni" sudah disiapkan.
// Lihat catatan struktur data di README backend (folder /api).
// Data: nama, nomor HP, kamar, tanggal masuk/keluar, harga sewa, status.

router.get('/', (req, res) => {
  res.json({ data: [], message: 'Belum terhubung ke database — masih tahap tampilan (V1).' })
})

export default router
