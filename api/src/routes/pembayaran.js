import { Router } from 'express'
import { pool } from '../config/db.js'

const router = Router()

// GET /api/pembayaran → daftar semua pembayaran, join ke penghuni & kamar
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.*,
        pe.nama AS nama_penghuni,
        k.nomor_kamar
      FROM pembayaran p
      JOIN penghuni pe ON pe.id = p.penghuni_id
      JOIN kamar k ON k.id = p.kamar_id
      ORDER BY p.jatuh_tempo DESC
    `)
    res.json({ data: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal memuat data pembayaran', error: err.message })
  }
})

// POST /api/pembayaran → tambah pembayaran baru
router.post('/', async (req, res) => {
  const {
    penghuni_id,
    kamar_id,
    jumlah_tagihan,
    jatuh_tempo,
    status,
    bukti_pembayaran_url,
    tanggal_bayar
  } = req.body

  if (!penghuni_id || !kamar_id || !jumlah_tagihan || !jatuh_tempo) {
    return res.status(400).json({ message: 'Data wajib belum lengkap' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO pembayaran
        (penghuni_id, kamar_id, jumlah_tagihan, jatuh_tempo, status, bukti_pembayaran_url, tanggal_bayar)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        penghuni_id,
        kamar_id,
        jumlah_tagihan,
        jatuh_tempo,
        status || 'belum_dibayar',
        bukti_pembayaran_url || null,
        tanggal_bayar || null
      ]
    )
    res.status(201).json({ data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal menambahkan pembayaran', error: err.message })
  }
})

// PUT /api/pembayaran/:id → ubah pembayaran (termasuk tandai lunas)
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const {
    penghuni_id,
    kamar_id,
    jumlah_tagihan,
    jatuh_tempo,
    status,
    bukti_pembayaran_url,
    tanggal_bayar
  } = req.body

  try {
    const result = await pool.query(
      `UPDATE pembayaran SET
        penghuni_id = $1,
        kamar_id = $2,
        jumlah_tagihan = $3,
        jatuh_tempo = $4,
        status = $5,
        bukti_pembayaran_url = $6,
        tanggal_bayar = $7,
        updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        penghuni_id,
        kamar_id,
        jumlah_tagihan,
        jatuh_tempo,
        status,
        bukti_pembayaran_url || null,
        tanggal_bayar || null,
        id
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pembayaran tidak ditemukan' })
    }

    res.json({ data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengubah pembayaran', error: err.message })
  }
})

// DELETE /api/pembayaran/:id → hapus pembayaran
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('DELETE FROM pembayaran WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pembayaran tidak ditemukan' })
    }
    res.json({ message: 'Pembayaran dihapus' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal menghapus pembayaran', error: err.message })
  }
})

export default router