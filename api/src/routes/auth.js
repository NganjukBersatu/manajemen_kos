import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../config/db.js'

const router = Router()

// POST /api/auth/login → cek username (email) & password
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi' })
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, password_hash FROM users WHERE email = $1',
      [username]
    )
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Username atau password salah' })
    }

    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ message: 'Username atau password salah' })
    }

    res.json({ data: { id: user.id, name: user.name, email: user.email } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal login', error: err.message })
  }
})

export default router