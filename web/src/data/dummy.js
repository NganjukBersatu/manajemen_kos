// Data contoh (dummy) untuk tahap tampilan awal.
// Nanti setiap bagian di sini akan diganti dengan pemanggilan ke /api/...

export const pemilik = {
  nama: 'Pak Rudi'
}

export const statistik = {
  totalKamar: 40,
  kamarTerisi: 35,
  kamarKosong: 5,
  okupansiPersen: 87.5,
  belumBayarJumlahPenghuni: 5,
  belumBayarTotal: 3750000,
  pendapatanBulanIni: 26250000,
  pendapatanPersenPerubahan: 8.2
}

export const perluPerhatian = {
  pembayaranBelumLunas: { jumlah: 5, total: 3750000 },
  kamarPerluPerbaikan: [
    { kamar: 'A12', masalah: 'AC rusak' },
    { kamar: 'B05', masalah: 'Keran bocor' }
  ],
  kontrakAkanBerakhir: { jumlah: 3, dalamHari: 30 }
}

export const statusKamar = {
  terisi: 35,
  kosong: 5,
  maintenance: 2
}

export const pembayaranTerbaru = [
  { penghuni: 'Andi', kamar: 'A01', tagihan: 750000, status: 'Lunas' },
  { penghuni: 'Budi', kamar: 'A02', tagihan: 750000, status: 'Belum Dibayar' },
  { penghuni: 'Citra', kamar: 'A03', tagihan: 850000, status: 'Lunas' },
  { penghuni: 'Dewi', kamar: 'A05', tagihan: 750000, status: 'Terlambat' },
  { penghuni: 'Eka', kamar: 'B01', tagihan: 800000, status: 'Lunas' }
]

export const grafikKeuangan = {
  bulan: ['Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep'],
  pendapatan: [22500000, 23100000, 24000000, 24800000, 25400000, 26250000],
  pengeluaran: [4800000, 5100000, 4950000, 5300000, 5250000, 5500000]
}

export const aktivitasTerbaru = [
  { waktu: '08:42', teks: 'Andi membayar Rp750.000', tipe: 'pembayaran' },
  { waktu: '08:15', teks: 'Kamar A12 melaporkan AC rusak', tipe: 'maintenance' },
  { waktu: '07:50', teks: 'Budi ditambahkan sebagai penghuni', tipe: 'penghuni' },
  { waktu: 'Kemarin', teks: 'Citra melakukan pembayaran', tipe: 'pembayaran' }
]

export const pengeluaranRingkasan = {
  pendapatan: 26250000,
  listrik: 2450000,
  air: 850000,
  internet: 500000,
  maintenance: 750000,
  lainnya: 950000
}
