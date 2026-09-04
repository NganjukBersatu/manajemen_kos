import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'kos-manager-secret-key'

// Middleware cek token penghuni
function authPenghuni(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token tidak ditemukan' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (decoded.role !== 'penghuni') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }
    req.penghuni = decoded
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid' })
  }
}

// GET /api/penghuni-portal/profil
router.get('/profil', authPenghuni, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.nama, p.no_hp, p.kamar_id, p.tanggal_masuk, p.status,
              p.harga_sewa, k.nomor_kamar
       FROM penghuni p
       LEFT JOIN kamar k ON k.id = p.kamar_id
       WHERE p.id = $1`,
      [req.penghuni.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' })
    }
    res.json({ data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengambil profil', error: err.message })
  }
})

// GET /api/penghuni-portal/tagihan
router.get('/tagihan', authPenghuni, async (req, res) => {
  try {
    const kamarId = req.penghuni.kamar_id

    const [listrik, air, internet] = await Promise.all([
      pool.query(
        `SELECT id, periode, total, jatuh_tempo, status, 'listrik' as jenis
         FROM tagihan_listrik WHERE kamar_id = $1 ORDER BY periode DESC`,
        [kamarId]
      ),
      pool.query(
        `SELECT id, periode, total, jatuh_tempo, status, 'air' as jenis
         FROM tagihan_air WHERE kamar_id = $1 ORDER BY periode DESC`,
        [kamarId]
      ),
      pool.query(
        `SELECT id, periode, total, jatuh_tempo, status, 'internet' as jenis
         FROM tagihan_internet WHERE kamar_id = $1 ORDER BY periode DESC`,
        [kamarId]
      )
    ])

    const semua = [
      ...listrik.rows,
      ...air.rows,
      ...internet.rows
    ].sort((a, b) => new Date(b.periode) - new Date(a.periode))

    res.json({ data: semua })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengambil tagihan', error: err.message })
  }
})

// GET /api/penghuni-portal/maintenance
router.get('/maintenance', authPenghuni, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, masalah, catatan, tanggal_laporan, prioritas, status, biaya, created_at
       FROM maintenance
       WHERE penghuni_id = $1 OR kamar_id = $2
       ORDER BY tanggal_laporan DESC, id DESC`,
      [req.penghuni.id, req.penghuni.kamar_id]
    )
    res.json({ data: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengambil laporan', error: err.message })
  }
})

// POST /api/penghuni-portal/maintenance → lapor masalah
router.post('/maintenance', authPenghuni, async (req, res) => {
  const { masalah, catatan, prioritas } = req.body

  if (!masalah) {
    return res.status(400).json({ message: 'Masalah wajib diisi' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO maintenance 
        (kamar_id, penghuni_id, masalah, catatan, tanggal_laporan, prioritas, status)
       VALUES ($1, $2, $3, $4, CURRENT_DATE, COALESCE($5, 'sedang'), 'masuk')
       RETURNING *`,
      [
        req.penghuni.kamar_id,
        req.penghuni.id,
        masalah,
        catatan || null,
        prioritas || 'sedang'
      ]
    )
    res.status(201).json({ data: result.rows[0], message: 'Laporan berhasil dikirim' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengirim laporan', error: err.message })
  }
})

export default router