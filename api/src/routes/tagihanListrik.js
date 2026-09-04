import { Router } from 'express'
import { pool } from '../config/db.js'

const router = Router()

const STATUS_VALID = ['lunas', 'belum_dibayar', 'terlambat']

// GET /api/tagihan/listrik → daftar tagihan listrik semua kamar, terbaru dulu
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT tl.id, tl.kamar_id, k.nomor_kamar, tl.periode, tl.meter_awal, tl.meter_akhir,
              tl.pemakaian, tl.tarif, tl.total, tl.jatuh_tempo, tl.status, tl.created_at
       FROM tagihan_listrik tl
       JOIN kamar k ON k.id = tl.kamar_id
       ORDER BY tl.periode DESC, k.nomor_kamar ASC`
    )
    res.json({ data: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengambil data tagihan listrik', error: err.message })
  }
})

// POST /api/tagihan/listrik → tambah tagihan baru
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
      `INSERT INTO tagihan_listrik (kamar_id, periode, meter_awal, meter_akhir, tarif, total, jatuh_tempo, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 'belum_dibayar'))
       RETURNING *`,
      [kamar_id, periode, meter_awal, meter_akhir, tarif, total, jatuh_tempo, status]
    )
    res.status(201).json({ data: result.rows[0] })
  } catch (err) {
    console.error(err)
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Tagihan listrik untuk kamar dan periode ini sudah ada' })
    }
    res.status(500).json({ message: 'Gagal menambah tagihan listrik', error: err.message })
  }
})

// PUT /api/tagihan/listrik/:id → ubah tagihan (total dihitung ulang otomatis)
router.put('/:id', async (req, res) => {
  const { meter_awal, meter_akhir, tarif, jatuh_tempo, status } = req.body

  if (status && !STATUS_VALID.includes(status)) {
    return res.status(400).json({ message: `status harus salah satu dari: ${STATUS_VALID.join(', ')}` })
  }

  try {
    const existing = await pool.query('SELECT * FROM tagihan_listrik WHERE id = $1', [req.params.id])
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
      `UPDATE tagihan_listrik
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
    res.status(500).json({ message: 'Gagal mengubah tagihan listrik', error: err.message })
  }
})

// DELETE /api/tagihan/listrik/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tagihan_listrik WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tagihan tidak ditemukan' })
    }
    res.json({ message: 'Tagihan listrik berhasil dihapus' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal menghapus tagihan listrik', error: err.message })
  }
})

export default router