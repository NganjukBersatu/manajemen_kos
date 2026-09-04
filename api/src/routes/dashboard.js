import { Router } from 'express'
import { pool } from '../config/db.js'

const router = Router()
const DEFAULT_KOS_ID = 1

router.get('/', async (req, res) => {
  try {
    // Status kamar
    const kamarResult = await pool.query(`SELECT status FROM kamar WHERE kos_id = $1`, [DEFAULT_KOS_ID])
    const totalKamar = kamarResult.rows.length
    const kamarTerisi = kamarResult.rows.filter(k => k.status === 'terisi').length
    const kamarKosong = kamarResult.rows.filter(k => k.status === 'kosong').length
    const kamarMaintenance = kamarResult.rows.filter(k => k.status === 'maintenance').length
    const okupansiPersen = totalKamar > 0 ? Math.round((kamarTerisi / totalKamar) * 100) : 0

    // Pembayaran belum lunas
    const belumBayarResult = await pool.query(
      `SELECT COUNT(DISTINCT p.penghuni_id) AS jumlah_penghuni, COALESCE(SUM(p.jumlah_tagihan), 0) AS total
       FROM pembayaran p
       JOIN kamar k ON k.id = p.kamar_id
       WHERE k.kos_id = $1 AND p.status != 'lunas'`,
      [DEFAULT_KOS_ID]
    )

    // Pendapatan bulan ini vs bulan lalu
    const pendapatanResult = await pool.query(
      `SELECT
         COALESCE(SUM(p.jumlah_tagihan) FILTER (
           WHERE date_trunc('month', p.tanggal_bayar) = date_trunc('month', CURRENT_DATE)
         ), 0) AS bulan_ini,
         COALESCE(SUM(p.jumlah_tagihan) FILTER (
           WHERE date_trunc('month', p.tanggal_bayar) = date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
         ), 0) AS bulan_lalu
       FROM pembayaran p
       JOIN kamar k ON k.id = p.kamar_id
       WHERE p.status = 'lunas' AND k.kos_id = $1`,
      [DEFAULT_KOS_ID]
    )
    const pendapatanBulanIni = Number(pendapatanResult.rows[0].bulan_ini)
    const pendapatanBulanLalu = Number(pendapatanResult.rows[0].bulan_lalu)
    const pendapatanPersenPerubahan = pendapatanBulanLalu > 0
      ? Math.round(((pendapatanBulanIni - pendapatanBulanLalu) / pendapatanBulanLalu) * 100)
      : 0

    // Kamar perlu perbaikan (dari tabel maintenance)
    let kamarPerluPerbaikan = []
    try {
      const maintenanceResult = await pool.query(
        `SELECT k.nomor_kamar AS kamar, m.masalah AS masalah
         FROM maintenance m
         JOIN kamar k ON k.id = m.kamar_id
         WHERE k.kos_id = $1 AND m.status != 'selesai'
         ORDER BY m.created_at DESC
         LIMIT 5`,
        [DEFAULT_KOS_ID]
      )
      kamarPerluPerbaikan = maintenanceResult.rows
    } catch (e) {
      console.error('Gagal ambil data maintenance untuk dashboard:', e.message)
    }

    // Kontrak akan berakhir dalam 30 hari
    const kontrakResult = await pool.query(
      `SELECT COUNT(*) AS jumlah
       FROM penghuni
       WHERE kamar_id IN (SELECT id FROM kamar WHERE kos_id = $1)
         AND status = 'aktif'
         AND tanggal_keluar IS NOT NULL
         AND tanggal_keluar BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'`,
      [DEFAULT_KOS_ID]
    )

    // Pembayaran terbaru (5 baris)
    const pembayaranTerbaruResult = await pool.query(
      `SELECT pe.nama AS penghuni, k.nomor_kamar AS kamar, p.jumlah_tagihan AS tagihan, p.status
       FROM pembayaran p
       JOIN penghuni pe ON pe.id = p.penghuni_id
       JOIN kamar k ON k.id = p.kamar_id
       WHERE k.kos_id = $1
       ORDER BY COALESCE(p.tanggal_bayar, p.jatuh_tempo) DESC
       LIMIT 5`,
      [DEFAULT_KOS_ID]
    )
    const labelStatus = (s) => (s === 'lunas' ? 'Lunas' : s === 'terlambat' ? 'Terlambat' : 'Belum Dibayar')

    // Grafik keuangan 6 bulan terakhir
    const grafikResult = await pool.query(
      `SELECT
         to_char(gs.bulan, 'Mon') AS label,
         COALESCE(pendapatan.total, 0) AS pendapatan,
         COALESCE(pengeluaran.total, 0) AS pengeluaran
       FROM generate_series(
         date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
         date_trunc('month', CURRENT_DATE),
         INTERVAL '1 month'
       ) AS gs(bulan)
       LEFT JOIN (
         SELECT date_trunc('month', p.tanggal_bayar) AS bulan, SUM(p.jumlah_tagihan) AS total
         FROM pembayaran p
         JOIN kamar k ON k.id = p.kamar_id
         WHERE p.status = 'lunas' AND k.kos_id = $1
         GROUP BY 1
       ) pendapatan ON pendapatan.bulan = gs.bulan
       LEFT JOIN (
         SELECT date_trunc('month', tanggal) AS bulan, SUM(jumlah) AS total
         FROM pengeluaran
         WHERE kos_id = $1
         GROUP BY 1
       ) pengeluaran ON pengeluaran.bulan = gs.bulan
       ORDER BY gs.bulan ASC`,
      [DEFAULT_KOS_ID]
    )

    // Aktivitas terbaru: gabungan maintenance, pembayaran lunas, penghuni baru
    let aktivitasMaintenance = []
    try {
      const r = await pool.query(
        `SELECT 'maintenance' AS tipe,
                'Kamar ' || k.nomor_kamar || ' melaporkan ' || m.masalah AS teks,
                m.created_at AS waktu
         FROM maintenance m
         JOIN kamar k ON k.id = m.kamar_id
         WHERE k.kos_id = $1
         ORDER BY m.created_at DESC LIMIT 5`,
        [DEFAULT_KOS_ID]
      )
      aktivitasMaintenance = r.rows
    } catch (e) {
      console.error('Gagal ambil aktivitas maintenance:', e.message)
    }

    const aktivitasPembayaranResult = await pool.query(
      `SELECT 'pembayaran' AS tipe,
              pe.nama || ' membayar Rp' || to_char(p.jumlah_tagihan, 'FM999,999,999') AS teks,
              p.tanggal_bayar AS waktu
       FROM pembayaran p
       JOIN penghuni pe ON pe.id = p.penghuni_id
       JOIN kamar k ON k.id = p.kamar_id
       WHERE p.status = 'lunas' AND k.kos_id = $1
       ORDER BY p.tanggal_bayar DESC LIMIT 5`,
      [DEFAULT_KOS_ID]
    )

    const aktivitasPenghuniResult = await pool.query(
      `SELECT 'penghuni' AS tipe,
              p.nama || ' ditambahkan sebagai penghuni' AS teks,
              p.created_at AS waktu
       FROM penghuni p
       JOIN kamar k ON k.id = p.kamar_id
       WHERE k.kos_id = $1
       ORDER BY p.created_at DESC LIMIT 5`,
      [DEFAULT_KOS_ID]
    )

    const aktivitasTerbaru = [
      ...aktivitasMaintenance,
      ...aktivitasPembayaranResult.rows,
      ...aktivitasPenghuniResult.rows
    ]
      .filter(a => a.waktu)
      .sort((a, b) => new Date(b.waktu) - new Date(a.waktu))
      .slice(0, 5)

    res.json({
      statistik: {
        totalKamar,
        kamarTerisi,
        kamarKosong,
        okupansiPersen,
        belumBayarJumlahPenghuni: Number(belumBayarResult.rows[0].jumlah_penghuni),
        belumBayarTotal: Number(belumBayarResult.rows[0].total),
        pendapatanBulanIni,
        pendapatanPersenPerubahan
      },
      perluPerhatian: {
        pembayaranBelumLunas: {
          jumlah: Number(belumBayarResult.rows[0].jumlah_penghuni),
          total: Number(belumBayarResult.rows[0].total)
        },
        kamarPerluPerbaikan,
        kontrakAkanBerakhir: {
          jumlah: Number(kontrakResult.rows[0].jumlah),
          dalamHari: 30
        }
      },
      statusKamar: {
        terisi: kamarTerisi,
        kosong: kamarKosong,
        maintenance: kamarMaintenance
      },
      pembayaranTerbaru: pembayaranTerbaruResult.rows.map(p => ({
        penghuni: p.penghuni,
        kamar: p.kamar,
        tagihan: Number(p.tagihan),
        status: labelStatus(p.status)
      })),
      grafikKeuangan: {
        bulan: grafikResult.rows.map(r => r.label),
        pendapatan: grafikResult.rows.map(r => Number(r.pendapatan)),
        pengeluaran: grafikResult.rows.map(r => Number(r.pengeluaran))
      },
      aktivitasTerbaru
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengambil data dashboard', error: err.message })
  }
})

export default router