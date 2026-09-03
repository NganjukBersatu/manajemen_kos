import { Router } from 'express'
import { pool } from '../config/db.js'

const router = Router()

// Catatan: karena belum ada login/multi-kos, sementara semua endpoint
// di sini menganggap kamu hanya punya 1 baris di tabel "kos" (id = 1).
// Nanti setelah fitur login dibuat, kos_id akan diambil dari user yang login.
const DEFAULT_KOS_ID = 1

// GET /api/kamar → daftar semua kamar
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT k.id, k.nomor_kamar, k.harga, k.status, k.fasilitas, k.foto_url,
              p.id AS penghuni_id, p.nama AS nama_penghuni
       FROM kamar k
       LEFT JOIN penghuni p ON p.kamar_id = k.id AND p.status = 'aktif'
       WHERE k.kos_id = $1
       ORDER BY k.nomor_kamar ASC`,
      [DEFAULT_KOS_ID]
    )
    res.json({ data: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengambil data kamar', error: err.message })
  }
})

// GET /api/kamar/:id → detail satu kamar
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM kamar WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kamar tidak ditemukan' })
    }
    res.json({ data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengambil data kamar', error: err.message })
  }
})

// POST /api/kamar → tambah kamar baru
router.post('/', async (req, res) => {
  const { nomor_kamar, harga, status, fasilitas, foto_url } = req.body
  if (!nomor_kamar || harga === undefined) {
    return res.status(400).json({ message: 'nomor_kamar dan harga wajib diisi' })
  }
  try {
    const result = await pool.query(
      `INSERT INTO kamar (kos_id, nomor_kamar, harga, status, fasilitas, foto_url)
       VALUES ($1, $2, $3, COALESCE($4, 'kosong'), $5, $6)
       RETURNING *`,
      [DEFAULT_KOS_ID, nomor_kamar, harga, status, fasilitas, foto_url]
    )
    res.status(201).json({ data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal menambah kamar', error: err.message })
  }
})

// PUT /api/kamar/:id → ubah data kamar
router.put('/:id', async (req, res) => {
  const { nomor_kamar, harga, status, fasilitas, foto_url } = req.body
  try {
    const result = await pool.query(
      `UPDATE kamar
       SET nomor_kamar = COALESCE($1, nomor_kamar),
           harga = COALESCE($2, harga),
           status = COALESCE($3, status),
           fasilitas = COALESCE($4, fasilitas),
           foto_url = COALESCE($5, foto_url),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [nomor_kamar, harga, status, fasilitas, foto_url, req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kamar tidak ditemukan' })
    }
    res.json({ data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengubah kamar', error: err.message })
  }
})

// DELETE /api/kamar/:id → hapus kamar
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM kamar WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kamar tidak ditemukan' })
    }
    res.json({ message: 'Kamar berhasil dihapus' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal menghapus kamar', error: err.message })
  }
})

export default router
