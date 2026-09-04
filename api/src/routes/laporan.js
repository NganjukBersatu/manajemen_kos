import { Router } from 'express'
import { pool } from '../config/db.js'

const router = Router()
const DEFAULT_KOS_ID = 1

// GET /api/laporan → ringkasan + rincian transaksi bulan berjalan
router.get('/', async (req, res) => {
  try {
    // Total pemasukan bulan ini: pembayaran berstatus lunas, dibayar bulan ini
    const pemasukanResult = await pool.query(`
      SELECT COALESCE(SUM(jumlah_tagihan), 0) AS total
      FROM pembayaran
      WHERE status = 'lunas'
        AND date_trunc('month', tanggal_bayar) = date_trunc('month', CURRENT_DATE)
    `)

    // Total pengeluaran bulan ini
    const pengeluaranResult = await pool.query(
      `SELECT COALESCE(SUM(jumlah), 0) AS total
       FROM pengeluaran
       WHERE kos_id = $1
         AND date_trunc('month', tanggal) = date_trunc('month', CURRENT_DATE)`,
      [DEFAULT_KOS_ID]
    )

    // Okupansi: kamar terisi vs total kamar
    const okupansiResult = await pool.query(
      `SELECT
         COUNT(*) AS total_kamar,
         COUNT(*) FILTER (WHERE status = 'terisi') AS kamar_terisi
       FROM kamar
       WHERE kos_id = $1`,
      [DEFAULT_KOS_ID]
    )

    // Rincian transaksi bulan ini: gabungan pemasukan (pembayaran lunas) & pengeluaran
    const rincianResult = await pool.query(
      `SELECT
         'pemasukan' AS jenis,
         pe.nama AS keterangan,
         k.nomor_kamar AS kamar,
         p.jumlah_tagihan AS jumlah,
         p.tanggal_bayar AS tanggal
       FROM pembayaran p
       JOIN penghuni pe ON pe.id = p.penghuni_id
       JOIN kamar k ON k.id = p.kamar_id
       WHERE p.status = 'lunas'
         AND date_trunc('month', p.tanggal_bayar) = date_trunc('month', CURRENT_DATE)

       UNION ALL

       SELECT
         'pengeluaran' AS jenis,
         COALESCE(deskripsi, kategori) AS keterangan,
         NULL AS kamar,
         jumlah,
         tanggal
       FROM pengeluaran
       WHERE kos_id = $1
         AND date_trunc('month', tanggal) = date_trunc('month', CURRENT_DATE)

       ORDER BY tanggal DESC`,
      [DEFAULT_KOS_ID]
    )

    const totalKamar = Number(okupansiResult.rows[0].total_kamar)
    const kamarTerisi = Number(okupansiResult.rows[0].kamar_terisi)
    const totalPemasukan = Number(pemasukanResult.rows[0].total)
    const totalPengeluaran = Number(pengeluaranResult.rows[0].total)

    res.json({
      data: {
        ringkasan: {
          total_pemasukan: totalPemasukan,
          total_pengeluaran: totalPengeluaran,
          keuntungan: totalPemasukan - totalPengeluaran,
          total_kamar: totalKamar,
          kamar_terisi: kamarTerisi,
          okupansi_persen: totalKamar > 0 ? Math.round((kamarTerisi / totalKamar) * 100) : 0
        },
        rincian: rincianResult.rows
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengambil data laporan', error: err.message })
  }
})

export default router