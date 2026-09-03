import { Router } from 'express'
import {
  statistik,
  perluPerhatian,
  statusKamar,
  pembayaranTerbaru,
  grafikKeuangan,
  aktivitasTerbaru
} from '../data/dummy.js'

const router = Router()

// GET /api/dashboard
// Mengembalikan seluruh data yang dibutuhkan halaman Dashboard sekaligus,
// supaya frontend cukup melakukan satu kali pemanggilan.
router.get('/', (req, res) => {
  res.json({
    statistik,
    perluPerhatian,
    statusKamar,
    pembayaranTerbaru,
    grafikKeuangan,
    aktivitasTerbaru
  })
})

export default router
