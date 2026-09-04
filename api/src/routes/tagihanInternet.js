import { Router } from 'express'
import { pool } from '../config/db.js'

const router = Router()

const STATUS_VALID = ['lunas', 'belum_dibayar', 'terlambat']

// GET /api/tagihan/internet → daftar tagihan internet semua kamar, terbaru dulu
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ti.id, ti.kamar_id, k.nomor_kamar, ti.periode, ti.provider, ti.paket,
              ti.tagihan, ti.jatuh_tempo, ti.status, ti.created_at
       FROM tagihan_internet ti
       JOIN kamar k ON k.id = ti.kamar_id
       ORDER BY ti.periode DESC, k.nomor_kamar ASC`
    )
    res.json({ data: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengambil data tagihan internet', error: err.message })
  }
})

// POST /api/tagihan/internet → tambah tagihan baru
router.post('/', async (req, res) => {
  const { kamar_id, periode, provider, paket, tagihan, jatuh_tempo, status } = req.body

  if (!kamar_id || !periode || !provider || !paket || !tagihan || !jatuh_tempo) {
    return res.status(400).json({ message: 'kamar_id, periode, provider, paket, tagihan, dan jatuh_tempo wajib diisi' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO tagihan_internet (kamar_id, periode, provider, paket, tagihan, jatuh_tempo, status)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'belum_dibayar'))
       RETURNING *`,
      [kamar_id, periode, provider, paket, tagihan, jatuh_tempo, status]
    )
    res.status(201).json({ data: result.rows[0] })
  } catch (err) {
    console.error(err)
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Tagihan internet untuk kamar dan periode ini sudah ada' })
    }
    res.status(500).json({ message: 'Gagal menambah tagihan internet', error: err.message })
  }
})

// PUT /api/tagihan/internet/:id → ubah tagihan
router.put('/:id', async (req, res) => {
  const { provider, paket, tagihan, jatuh_tempo, status } = req.body

  if (status && !STATUS_VALID.includes(status)) {
    return res.status(400).json({ message: `status harus salah satu dari: ${STATUS_VALID.join(', ')}` })
  }

  try {
    const existing = await pool.query('SELECT * FROM tagihan_internet WHERE id = $1', [req.params.id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Tagihan tidak ditemukan' })
    }

    const result = await pool.query(
      `UPDATE tagihan_internet
       SET provider = COALESCE($1, provider),
           paket = COALESCE($2, paket),
           tagihan = COALESCE($3, tagihan),
           jatuh_tempo = COALESCE($4, jatuh_tempo),
           status = COALESCE($5, status)
       WHERE id = $6
       RETURNING *`,
      [provider, paket, tagihan, jatuh_tempo, status, req.params.id]
    )
    res.json({ data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengubah tagihan internet', error: err.message })
  }
})

// DELETE /api/tagihan/internet/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tagihan_internet WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tagihan tidak ditemukan' })
    }
    res.json({ message: 'Tagihan internet berhasil dihapus' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal menghapus tagihan internet', error: err.message })
  }
})

export default router