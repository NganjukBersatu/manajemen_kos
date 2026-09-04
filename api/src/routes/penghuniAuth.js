import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'kos-manager-secret-key'

// POST /api/penghuni/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi' })
  }

  try {
    const result = await pool.query(
      `SELECT p.id, p.nama, p.username, p.password, p.kamar_id, p.status,
              k.nomor_kamar, k.harga_sewa
       FROM penghuni p
       LEFT JOIN kamar k ON k.id = p.kamar_id
       WHERE p.username = $1`,
      [username]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Username atau password salah' })
    }

    const penghuni = result.rows[0]

    if (penghuni.status !== 'aktif') {
      return res.status(403).json({ message: 'Akun penghuni tidak aktif' })
    }

    // Cek password (support plain text dulu, nanti bisa diganti hash)
    const isMatch = penghuni.password === password || 
                    (penghuni.password?.startsWith('$2') && await bcrypt.compare(password, penghuni.password))

    if (!isMatch) {
      return res.status(401).json({ message: 'Username atau password salah' })
    }

    const token = jwt.sign(
      {
        id: penghuni.id,
        role: 'penghuni',
        kamar_id: penghuni.kamar_id,
        nama: penghuni.nama
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login berhasil',
      token,
      data: {
        id: penghuni.id,
        nama: penghuni.nama,
        username: penghuni.username,
        kamar_id: penghuni.kamar_id,
        nomor_kamar: penghuni.nomor_kamar,
        harga_sewa: penghuni.harga_sewa
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal login', error: err.message })
  }
})

export default router