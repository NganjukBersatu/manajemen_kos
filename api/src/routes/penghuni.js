import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../config/db.js'

const router = Router()

// ====================== DEFAULT TAGIHAN OTOMATIS ======================
// Silakan ubah nilai default di bawah sesuai kebutuhan kos kamu
const DEFAULT_TARIF_AIR = 5000          // Rp per m³
const DEFAULT_TARIF_LISTRIK = 1500      // Rp per kWh
const DEFAULT_INTERNET = {
  provider: 'IndiHome',
  paket: '20Mbps',
  tagihan: 150000
}
// ======================================================================

// Helper: ubah tanggal menjadi format periode "September 2026"
function formatPeriode(tanggal) {
  const date = new Date(tanggal)
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

// GET /api/penghuni → daftar semua penghuni beserta info kamarnya
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.kamar_id, p.nama, p.no_hp, p.tanggal_masuk, p.tanggal_keluar,
              p.harga_sewa, p.status, p.username, k.nomor_kamar
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
      `SELECT p.id, p.kamar_id, p.nama, p.no_hp, p.tanggal_masuk, p.tanggal_keluar,
              p.harga_sewa, p.status, p.username, k.nomor_kamar
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
// Saat penghuni baru ditambahkan:
// 1. status kamar otomatis diubah jadi "terisi"
// 2. tagihan pembayaran (sewa) bulan pertama otomatis dibuat
// 3. tagihan Air, Listrik, dan Internet otomatis dibuat (sebagai placeholder)
router.post('/', async (req, res) => {
  const { kamar_id, nama, no_hp, tanggal_masuk, harga_sewa, username, password } = req.body
  if (!kamar_id || !nama || !tanggal_masuk || harga_sewa === undefined) {
    return res.status(400).json({ message: 'kamar_id, nama, tanggal_masuk, dan harga_sewa wajib diisi' })
  }
  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Cek username belum dipakai
    const existing = await client.query('SELECT id FROM penghuni WHERE username = $1', [username])
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK')
      return res.status(409).json({ message: 'Username sudah digunakan' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // 1. Insert penghuni
    const insertResult = await client.query(
      `INSERT INTO penghuni (kamar_id, nama, no_hp, tanggal_masuk, harga_sewa, username, password)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, kamar_id, nama, no_hp, tanggal_masuk, tanggal_keluar, harga_sewa, status, username`,
      [kamar_id, nama, no_hp, tanggal_masuk, harga_sewa, username, passwordHash]
    )
    const penghuniBaru = insertResult.rows[0]

    // 2. Update status kamar jadi "terisi"
    await client.query(
      `UPDATE kamar SET status = 'terisi', updated_at = NOW() WHERE id = $1`,
      [kamar_id]
    )

    // 3. Buat tagihan SEWA (pembayaran) bulan pertama
    await client.query(
      `INSERT INTO pembayaran (penghuni_id, kamar_id, jumlah_tagihan, jatuh_tempo, status)
       VALUES ($1, $2, $3, ($4::date + interval '1 month')::date, 'belum_dibayar')`,
      [penghuniBaru.id, kamar_id, harga_sewa, tanggal_masuk]
    )

    // ====================== BUAT TAGIHAN OTOMATIS ======================
    const periode = formatPeriode(tanggal_masuk)
    const jatuhTempo = await client.query(
      `SELECT ($1::date + interval '1 month')::date AS jatuh_tempo`,
      [tanggal_masuk]
    )
    const jatuh_tempo = jatuhTempo.rows[0].jatuh_tempo

    // 4. Tagihan AIR (meter 0 dulu, nanti diisi saat pencatatan)
    await client.query(
      `INSERT INTO tagihan_air 
         (kamar_id, periode, meter_awal, meter_akhir, tarif, total, jatuh_tempo, status)
       VALUES ($1, $2, 0, 0, $3, 0, $4, 'belum_dibayar')
       ON CONFLICT DO NOTHING`,
      [kamar_id, periode, DEFAULT_TARIF_AIR, jatuh_tempo]
    )

    // 5. Tagihan LISTRIK (meter 0 dulu)
    await client.query(
      `INSERT INTO tagihan_listrik 
         (kamar_id, periode, meter_awal, meter_akhir, tarif, total, jatuh_tempo, status)
       VALUES ($1, $2, 0, 0, $3, 0, $4, 'belum_dibayar')
       ON CONFLICT DO NOTHING`,
      [kamar_id, periode, DEFAULT_TARIF_LISTRIK, jatuh_tempo]
    )

    // 6. Tagihan INTERNET (paket default)
    await client.query(
      `INSERT INTO tagihan_internet 
         (kamar_id, periode, provider, paket, tagihan, jatuh_tempo, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'belum_dibayar')
       ON CONFLICT DO NOTHING`,
      [
        kamar_id,
        periode,
        DEFAULT_INTERNET.provider,
        DEFAULT_INTERNET.paket,
        DEFAULT_INTERNET.tagihan,
        jatuh_tempo
      ]
    )
    // ==================================================================

    await client.query('COMMIT')
    res.status(201).json({ data: penghuniBaru })
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
  const { nama, no_hp, tanggal_masuk, tanggal_keluar, harga_sewa, status, username, password } = req.body
  try {
    if (username) {
      const existing = await pool.query(
        'SELECT id FROM penghuni WHERE username = $1 AND id != $2',
        [username, req.params.id]
      )
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: 'Username sudah digunakan' })
      }
    }

    const passwordHash = password ? await bcrypt.hash(password, 10) : null

    const result = await pool.query(
      `UPDATE penghuni
       SET nama = COALESCE($1, nama),
           no_hp = COALESCE($2, no_hp),
           tanggal_masuk = COALESCE($3, tanggal_masuk),
           tanggal_keluar = COALESCE($4, tanggal_keluar),
           harga_sewa = COALESCE($5, harga_sewa),
           status = COALESCE($6, status),
           username = COALESCE($7, username),
           password = COALESCE($8, password),
           updated_at = NOW()
       WHERE id = $9
       RETURNING id, kamar_id, nama, no_hp, tanggal_masuk, tanggal_keluar, harga_sewa, status, username`,
      [nama, no_hp, tanggal_masuk, tanggal_keluar, harga_sewa, status, username, passwordHash, req.params.id]
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
    await client.query(
      `UPDATE kamar SET status = 'kosong', updated_at = NOW() WHERE id = $1`,
      [found.rows[0].kamar_id]
    )

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