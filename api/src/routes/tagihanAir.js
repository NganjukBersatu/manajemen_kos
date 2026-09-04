import { Router } from 'express'
import { pool } from '../config/db.js'

const router = Router()

const STATUS_VALID = ['lunas', 'belum_dibayar', 'terlambat']

// GET /api/tagihan/air → daftar tagihan air semua kamar, terbaru dulu
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ta.id, ta.kamar_id, k.nomor_kamar, ta.periode, ta.meter_awal, ta.meter_akhir,
              ta.pemakaian, ta.tarif, ta.total, ta.jatuh_tempo, ta.status, ta.created_at
       FROM tagihan_air ta
       JOIN kamar k ON k.id = ta.kamar_id
       ORDER BY ta.periode DESC, k.nomor_kamar ASC`
    )
    res.json({ data: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengambil data tagihan air', error: err.message })
  }
})

// POST /api/tagihan/air → tambah tagihan baru
// Total dihitung otomatis dari (meter_akhir - meter_awal) * tarif
router.post('/', async (req, res) => {
  const { kamar_id, periode, meter_awal, meter_akhir, tarif, jatuh_tempo, status } = req.body

  if (!kamar_id || !periode || meter_awal === undefined || meter_akhir === undefined || !tarif || !jatuh_tempo) {
    return res.status(400).json({ message: 'kamar_id, periode, meter_awal, meter_akhir, tarif, dan jatuh_tempo wajib diisi' })
  }
  if (Number(meter_akhir) < Number(meter_awal)) {
    return res.status(400).json({ message: 'meter_akhir tidak boleh lebih kecil dari meter_awal' })
  }

  const pemakaian = Number(meter_akhir) - Number(meter_awal)
  const total = pemakaian * Number(tarif)

  try {
    const result = await pool.query(
      `INSERT INTO tagihan_air (kamar_id, periode, meter_awal, meter_akhir, tarif, total, jatuh_tempo, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 'belum_dibayar'))
       RETURNING *`,
      [kamar_id, periode, meter_awal, meter_akhir, tarif, total, jatuh_tempo, status]
    )
    res.status(201).json({ data: result.rows[0] })
  } catch (err) {
    console.error(err)
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Tagihan air untuk kamar dan periode ini sudah ada' })
    }
    res.status(500).json({ message: 'Gagal menambah tagihan air', error: err.message })
  }
})

// PUT /api/tagihan/air/:id → ubah tagihan (total dihitung ulang otomatis)
router.put('/:id', async (req, res) => {
  const { meter_awal, meter_akhir, tarif, jatuh_tempo, status } = req.body

  if (status && !STATUS_VALID.includes(status)) {
    return res.status(400).json({ message: `status harus salah satu dari: ${STATUS_VALID.join(', ')}` })
  }

  try {
    const existing = await pool.query('SELECT * FROM tagihan_air WHERE id = $1', [req.params.id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Tagihan tidak ditemukan' })
    }
    const current = existing.rows[0]

    const finalMeterAwal = meter_awal ?? current.meter_awal
    const finalMeterAkhir = meter_akhir ?? current.meter_akhir
    const finalTarif = tarif ?? current.tarif
    const pemakaian = Number(finalMeterAkhir) - Number(finalMeterAwal)
    const total = pemakaian * Number(finalTarif)

    const result = await pool.query(
      `UPDATE tagihan_air
       SET meter_awal = $1, meter_akhir = $2, tarif = $3, total = $4,
           jatuh_tempo = COALESCE($5, jatuh_tempo),
           status = COALESCE($6, status)
       WHERE id = $7
       RETURNING *`,
      [finalMeterAwal, finalMeterAkhir, finalTarif, total, jatuh_tempo, status, req.params.id]
    )
    res.json({ data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengubah tagihan air', error: err.message })
  }
})

// DELETE /api/tagihan/air/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tagihan_air WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tagihan tidak ditemukan' })
    }
    res.json({ message: 'Tagihan air berhasil dihapus' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal menghapus tagihan air', error: err.message })
  }
})

export default router