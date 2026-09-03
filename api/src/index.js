import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import { testConnection } from './config/db.js'
import dashboardRoutes from './routes/dashboard.js'
import kamarRoutes from './routes/kamar.js'
import penghuniRoutes from './routes/penghuni.js'
import pembayaranRoutes from './routes/pembayaran.js'
import tagihanListrikRoutes from './routes/tagihanListrik.js'
import tagihanAirRoutes from './routes/tagihanAir.js'
import tagihanInternetRoutes from './routes/tagihanInternet.js'
import pengeluaranRoutes from './routes/pengeluaran.js'
import maintenanceRoutes from './routes/maintenance.js'
import laporanRoutes from './routes/laporan.js'
import authRoutes from './routes/auth.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'kos-manager-api' })
})

app.use('/api/dashboard', dashboardRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/kamar', kamarRoutes)
app.use('/api/penghuni', penghuniRoutes)
app.use('/api/pembayaran', pembayaranRoutes)
app.use('/api/tagihan/listrik', tagihanListrikRoutes)
app.use('/api/tagihan/air', tagihanAirRoutes)
app.use('/api/tagihan/internet', tagihanInternetRoutes)
app.use('/api/pengeluaran', pengeluaranRoutes)
app.use('/api/maintenance', maintenanceRoutes)
app.use('/api/laporan', laporanRoutes)

app.listen(PORT, async () => {
  console.log(`Kos Manager API berjalan di http://localhost:${PORT}`)
  await testConnection()
})
