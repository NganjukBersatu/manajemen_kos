import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'kos-manager-secret-key'

// POST /api/auth/login → login gabungan (Pemilik & Penghuni)
router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi' })
  }

  try {
    // ============================================
    // 1. Cek sebagai PEMILIK (tabel users)
    // ============================================
    const pemilikResult = await pool.query(
      'SELECT id, name, email, password_hash FROM users WHERE email = $1',
      [username]
    )

    if (pemilikResult.rows.length > 0) {
      const user = pemilikResult.rows[0]
      const valid = await bcrypt.compare(password, user.password_hash)

      if (valid) {
        const token = jwt.sign(
          { id: user.id, role: 'pemilik', name: user.name },
          JWT_SECRET,
          { expiresIn: '7d' }
        )

        return res.json({
          message: 'Login berhasil',
          role: 'pemilik',
          token,
          data: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        })
      }
    }

    // ============================================
    // 2. Cek sebagai PENGHUNI (tabel penghuni)
    // ============================================
    const penghuniResult = await pool.query(
      `SELECT p.id, p.nama, p.username, p.password, p.kamar_id, p.status,
              k.nomor_kamar, p.harga_sewa
       FROM penghuni p
       LEFT JOIN kamar k ON k.id = p.kamar_id
       WHERE p.username = $1`,
      [username]
    )

    if (penghuniResult.rows.length > 0) {
      const penghuni = penghuniResult.rows[0]

      if (penghuni.status !== 'aktif') {
        return res.status(403).json({ message: 'Akun penghuni tidak aktif' })
      }

      // Support password plain text atau sudah di-hash
      let valid = false
      if (penghuni.password?.startsWith('$2')) {
        valid = await bcrypt.compare(password, penghuni.password)
      } else {
        valid = penghuni.password === password
      }

      if (valid) {
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

        return res.json({
          message: 'Login berhasil',
          role: 'penghuni',
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
      }
    }

    // Tidak ketemu di keduanya
    return res.status(401).json({ message: 'Username atau password salah' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal login', error: err.message })
  }
})

// PUT /api/auth/profil → ubah nama & email (username login) pemilik
router.put('/profil', async (req, res) => {
  const { id, name, email } = req.body

  if (!id || !name || !email) {
    return res.status(400).json({ message: 'id, name, dan email wajib diisi' })
  }

  try {
    // Pastikan email baru belum dipakai pemilik lain
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, id]
    )
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email sudah digunakan akun lain' })
    }

    const result = await pool.query(
      `UPDATE users
       SET name = $1, email = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, email`,
      [name, email, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Akun tidak ditemukan' })
    }

    res.json({ message: 'Profil berhasil diperbarui', data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal memperbarui profil', error: err.message })
  }
})

// PUT /api/auth/password → ubah password pemilik (wajib verifikasi password lama)
router.put('/password', async (req, res) => {
  const { id, currentPassword, newPassword } = req.body

  if (!id || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Password lama dan password baru wajib diisi' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password baru minimal 6 karakter' })
  }

  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Akun tidak ditemukan' })
    }

    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash)
    if (!valid) {
      return res.status(401).json({ message: 'Password lama salah' })
    }

    const newHash = await bcrypt.hash(newPassword, 10)
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newHash, id]
    )

    res.json({ message: 'Password berhasil diperbarui' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal memperbarui password', error: err.message })
  }
})

export default router