import { Router } from 'express'
import { pool } from '../config/db.js'

const router = Router()

// GET /api/penghuni → daftar semua penghuni beserta info kamarnya
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
  `SELECT p.id, p.kamar_id, p.nama, p.no_hp, p.tanggal_masuk, p.tanggal_keluar,
          p.harga_sewa, p.status, k.nomor_kamar
   FROM penghuni p
   JOIN kamar k ON k.id = p.kamar_id
   ORDER BY p.created_at DESC`
)
    res.json({ data: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengambil data penghuni', error: err.message })
  }
})

// GET /api/penghuni/:id → detail satu penghuni
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, k.nomor_kamar
       FROM penghuni p
       JOIN kamar k ON k.id = p.kamar_id
       WHERE p.id = $1`,
      [req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Penghuni tidak ditemukan' })
    }
    res.json({ data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengambil data penghuni', error: err.message })
  }
})

// POST /api/penghuni → tambah penghuni baru
// Saat penghuni baru ditambahkan, status kamar otomatis diubah jadi "terisi".
router.post('/', async (req, res) => {
  const { kamar_id, nama, no_hp, tanggal_masuk, harga_sewa } = req.body
  if (!kamar_id || !nama || !tanggal_masuk || harga_sewa === undefined) {
    return res.status(400).json({ message: 'kamar_id, nama, tanggal_masuk, dan harga_sewa wajib diisi' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const insertResult = await client.query(
      `INSERT INTO penghuni (kamar_id, nama, no_hp, tanggal_masuk, harga_sewa)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [kamar_id, nama, no_hp, tanggal_masuk, harga_sewa]
    )

    await client.query(`UPDATE kamar SET status = 'terisi', updated_at = NOW() WHERE id = $1`, [kamar_id])

    await client.query('COMMIT')
    res.status(201).json({ data: insertResult.rows[0] })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ message: 'Gagal menambah penghuni', error: err.message })
  } finally {
    client.release()
  }
})

// PUT /api/penghuni/:id → ubah data penghuni
router.put('/:id', async (req, res) => {
  const { nama, no_hp, tanggal_masuk, tanggal_keluar, harga_sewa, status } = req.body
  try {
    const result = await pool.query(
      `UPDATE penghuni
       SET nama = COALESCE($1, nama),
           no_hp = COALESCE($2, no_hp),
           tanggal_masuk = COALESCE($3, tanggal_masuk),
           tanggal_keluar = COALESCE($4, tanggal_keluar),
           harga_sewa = COALESCE($5, harga_sewa),
           status = COALESCE($6, status),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [nama, no_hp, tanggal_masuk, tanggal_keluar, harga_sewa, status, req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Penghuni tidak ditemukan' })
    }
    res.json({ data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengubah penghuni', error: err.message })
  }
})

// DELETE /api/penghuni/:id → hapus penghuni (kamar otomatis jadi "kosong")
router.delete('/:id', async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const found = await client.query('SELECT kamar_id FROM penghuni WHERE id = $1', [req.params.id])
    if (found.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Penghuni tidak ditemukan' })
    }

    await client.query('DELETE FROM penghuni WHERE id = $1', [req.params.id])
    await client.query(`UPDATE kamar SET status = 'kosong', updated_at = NOW() WHERE id = $1`, [found.rows[0].kamar_id])

    await client.query('COMMIT')
    res.json({ message: 'Penghuni berhasil dihapus' })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ message: 'Gagal menghapus penghuni', error: err.message })
  } finally {
    client.release()
  }
})

export default router
