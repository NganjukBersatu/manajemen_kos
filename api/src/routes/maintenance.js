import { Router } from 'express'
import { pool } from '../config/db.js'

const router = Router()

const STATUS_VALID = ['masuk', 'diproses', 'diperbaiki', 'selesai']
const PRIORITAS_VALID = ['rendah', 'sedang', 'tinggi']

// GET /api/maintenance
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.id, m.kamar_id, k.nomor_kamar, m.penghuni_id, m.masalah,
              m.tanggal_laporan, m.prioritas, m.status, m.biaya, m.catatan,
              m.created_at, m.updated_at
       FROM maintenance m
       JOIN kamar k ON k.id = m.kamar_id
       ORDER BY m.tanggal_laporan DESC, m.id DESC`
    )
    res.json({ data: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengambil data maintenance', error: err.message })
  }
})

// POST /api/maintenance
router.post('/', async (req, res) => {
  const { kamar_id, penghuni_id, masalah, tanggal_laporan, prioritas, status, biaya, catatan } = req.body

  if (!kamar_id || !masalah) {
    return res.status(400).json({ message: 'kamar_id dan masalah wajib diisi' })
  }
  if (status && !STATUS_VALID.includes(status)) {
    return res.status(400).json({ message: `status harus salah satu dari: ${STATUS_VALID.join(', ')}` })
  }
  if (prioritas && !PRIORITAS_VALID.includes(prioritas)) {
    return res.status(400).json({ message: `prioritas harus salah satu dari: ${PRIORITAS_VALID.join(', ')}` })
  }

  try {
    const result = await pool.query(
      `INSERT INTO maintenance 
        (kamar_id, penghuni_id, masalah, tanggal_laporan, prioritas, status, biaya, catatan)
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), COALESCE($5, 'sedang'), COALESCE($6, 'masuk'), $7, $8)
       RETURNING *`,
      [kamar_id, penghuni_id || null, masalah, tanggal_laporan, prioritas, status, biaya || null, catatan || null]
    )
    res.status(201).json({ data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal menambah laporan maintenance', error: err.message })
  }
})

// PUT /api/maintenance/:id
router.put('/:id', async (req, res) => {
  const { masalah, tanggal_laporan, prioritas, status, biaya, catatan } = req.body

  if (status && !STATUS_VALID.includes(status)) {
    return res.status(400).json({ message: `status harus salah satu dari: ${STATUS_VALID.join(', ')}` })
  }
  if (prioritas && !PRIORITAS_VALID.includes(prioritas)) {
    return res.status(400).json({ message: `prioritas harus salah satu dari: ${PRIORITAS_VALID.join(', ')}` })
  }

  try {
    const existing = await pool.query('SELECT * FROM maintenance WHERE id = $1', [req.params.id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan' })
    }

    const result = await pool.query(
      `UPDATE maintenance
       SET masalah = COALESCE($1, masalah),
           tanggal_laporan = COALESCE($2, tanggal_laporan),
           prioritas = COALESCE($3, prioritas),
           status = COALESCE($4, status),
           biaya = COALESCE($5, biaya),
           catatan = COALESCE($6, catatan),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [masalah, tanggal_laporan, prioritas, status, biaya, catatan, req.params.id]
    )
    res.json({ data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengubah laporan maintenance', error: err.message })
  }
})

// DELETE /api/maintenance/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM maintenance WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan' })
    }
    res.json({ message: 'Laporan maintenance berhasil dihapus' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal menghapus laporan maintenance', error: err.message })
  }
})

export default router