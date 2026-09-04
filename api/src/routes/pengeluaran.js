import { Router } from 'express'
import { pool } from '../config/db.js'

const router = Router()

// Sama seperti kamar & penghuni: sementara masih 1 kos (id = 1)
// sampai fitur login/multi-kos dibuat.
const DEFAULT_KOS_ID = 1

const KATEGORI_VALID = ['listrik', 'air', 'internet', 'maintenance', 'kebersihan', 'gaji', 'perlengkapan', 'lainnya']

// GET /api/pengeluaran → daftar pengeluaran, terbaru dulu
// Query opsional: ?bulan=2026-09 untuk filter per bulan
router.get('/', async (req, res) => {
  try {
    const { bulan } = req.query
    const params = [DEFAULT_KOS_ID]
    let where = 'WHERE kos_id = $1'

    if (bulan) {
      params.push(bulan)
      where += ` AND to_char(tanggal, 'YYYY-MM') = $2`
    }

    const result = await pool.query(
      `SELECT id, kategori, jumlah, deskripsi, tanggal, created_at
       FROM pengeluaran
       ${where}
       ORDER BY tanggal DESC, created_at DESC`,
      params
    )

    const totalResult = await pool.query(
      `SELECT COALESCE(SUM(jumlah), 0) AS total FROM pengeluaran ${where}`,
      params
    )

    res.json({ data: result.rows, total: Number(totalResult.rows[0].total) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengambil data pengeluaran', error: err.message })
  }
})

// POST /api/pengeluaran → tambah pengeluaran baru
router.post('/', async (req, res) => {
  const { kategori, jumlah, deskripsi, tanggal } = req.body

  if (!kategori || jumlah === undefined || !tanggal) {
    return res.status(400).json({ message: 'kategori, jumlah, dan tanggal wajib diisi' })
  }
  if (!KATEGORI_VALID.includes(kategori)) {
    return res.status(400).json({ message: `kategori harus salah satu dari: ${KATEGORI_VALID.join(', ')}` })
  }

  try {
    const result = await pool.query(
      `INSERT INTO pengeluaran (kos_id, kategori, jumlah, deskripsi, tanggal)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [DEFAULT_KOS_ID, kategori, jumlah, deskripsi, tanggal]
    )
    res.status(201).json({ data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal menambah pengeluaran', error: err.message })
  }
})

// PUT /api/pengeluaran/:id → ubah pengeluaran
router.put('/:id', async (req, res) => {
  const { kategori, jumlah, deskripsi, tanggal } = req.body

  if (kategori && !KATEGORI_VALID.includes(kategori)) {
    return res.status(400).json({ message: `kategori harus salah satu dari: ${KATEGORI_VALID.join(', ')}` })
  }

  try {
    const result = await pool.query(
      `UPDATE pengeluaran
       SET kategori = COALESCE($1, kategori),
           jumlah = COALESCE($2, jumlah),
           deskripsi = COALESCE($3, deskripsi),
           tanggal = COALESCE($4, tanggal)
       WHERE id = $5 AND kos_id = $6
       RETURNING *`,
      [kategori, jumlah, deskripsi, tanggal, req.params.id, DEFAULT_KOS_ID]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pengeluaran tidak ditemukan' })
    }
    res.json({ data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengubah pengeluaran', error: err.message })
  }
})

// DELETE /api/pengeluaran/:id → hapus pengeluaran
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM pengeluaran WHERE id = $1 AND kos_id = $2 RETURNING id',
      [req.params.id, DEFAULT_KOS_ID]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pengeluaran tidak ditemukan' })
    }
    res.json({ message: 'Pengeluaran berhasil dihapus' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal menghapus pengeluaran', error: err.message })
  }
})

export default router