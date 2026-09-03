-- ============================================================
-- SKEMA DATABASE: manajemen_kos
-- Jalankan file ini di Query Tool pgAdmin, pastikan database
-- aktif yang dipilih adalah "manajemen_kos".
-- ============================================================

-- ---------D------------------------------------------------
-- 1. USERS (pemilik kos yang login ke dashboard)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 2. KOS (profil properti kos, satu user bisa punya banyak kos)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS kos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nama_kos VARCHAR(150) NOT NULL,
  alamat TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 3. KAMAR
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS kamar (
  id SERIAL PRIMARY KEY,
  kos_id INTEGER NOT NULL REFERENCES kos(id) ON DELETE CASCADE,
  nomor_kamar VARCHAR(20) NOT NULL,
  harga NUMERIC(12, 2) NOT NULL CHECK (harga >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'kosong' CHECK (status IN ('terisi', 'kosong', 'maintenance')),
  fasilitas TEXT,
  foto_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (kos_id, nomor_kamar)
);

-- ---------------------------------------------------------
-- 4. PENGHUNI
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS penghuni (
  id SERIAL PRIMARY KEY,
  kamar_id INTEGER NOT NULL REFERENCES kamar(id) ON DELETE CASCADE,
  nama VARCHAR(150) NOT NULL,
  no_hp VARCHAR(20),
  tanggal_masuk DATE NOT NULL,
  tanggal_keluar DATE,
  harga_sewa NUMERIC(12, 2) NOT NULL CHECK (harga_sewa >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 5. PEMBAYARAN (pembayaran sewa kamar)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS pembayaran (
  id SERIAL PRIMARY KEY,
  penghuni_id INTEGER NOT NULL REFERENCES penghuni(id) ON DELETE CASCADE,
  kamar_id INTEGER NOT NULL REFERENCES kamar(id) ON DELETE CASCADE,
  jumlah_tagihan NUMERIC(12, 2) NOT NULL CHECK (jumlah_tagihan >= 0),
  jatuh_tempo DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'belum_dibayar' CHECK (status IN ('lunas', 'belum_dibayar', 'terlambat')),
  bukti_pembayaran_url TEXT,
  tanggal_bayar DATE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 6. TAGIHAN LISTRIK (per kamar, per periode)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS tagihan_listrik (
  id SERIAL PRIMARY KEY,
  kamar_id INTEGER NOT NULL REFERENCES kamar(id) ON DELETE CASCADE,
  periode VARCHAR(20) NOT NULL, -- contoh: '2026-09'
  meter_awal NUMERIC(10, 2) NOT NULL,
  meter_akhir NUMERIC(10, 2) NOT NULL,
  pemakaian NUMERIC(10, 2) GENERATED ALWAYS AS (meter_akhir - meter_awal) STORED,
  tarif NUMERIC(10, 2) NOT NULL CHECK (tarif >= 0),
  total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  jatuh_tempo DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'belum_dibayar' CHECK (status IN ('lunas', 'belum_dibayar', 'terlambat')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (kamar_id, periode)
);

-- ---------------------------------------------------------
-- 7. TAGIHAN AIR (per kamar, per periode)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS tagihan_air (
  id SERIAL PRIMARY KEY,
  kamar_id INTEGER NOT NULL REFERENCES kamar(id) ON DELETE CASCADE,
  periode VARCHAR(20) NOT NULL,
  meter_awal NUMERIC(10, 2) NOT NULL,
  meter_akhir NUMERIC(10, 2) NOT NULL,
  pemakaian NUMERIC(10, 2) GENERATED ALWAYS AS (meter_akhir - meter_awal) STORED,
  tarif NUMERIC(10, 2) NOT NULL CHECK (tarif >= 0),
  total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  jatuh_tempo DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'belum_dibayar' CHECK (status IN ('lunas', 'belum_dibayar', 'terlambat')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (kamar_id, periode)
);

-- ---------------------------------------------------------
-- 8. TAGIHAN INTERNET (biasanya per kos, bukan per kamar)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS tagihan_internet (
  id SERIAL PRIMARY KEY,
  kos_id INTEGER NOT NULL REFERENCES kos(id) ON DELETE CASCADE,
  provider VARCHAR(100) NOT NULL,
  paket VARCHAR(100),
  periode VARCHAR(20) NOT NULL,
  tagihan NUMERIC(12, 2) NOT NULL CHECK (tagihan >= 0),
  jatuh_tempo DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'belum_dibayar' CHECK (status IN ('lunas', 'belum_dibayar', 'terlambat')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (kos_id, periode)
);

-- ---------------------------------------------------------
-- 9. PENGELUARAN (biaya operasional di luar tagihan sewa)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS pengeluaran (
  id SERIAL PRIMARY KEY,
  kos_id INTEGER NOT NULL REFERENCES kos(id) ON DELETE CASCADE,
  kategori VARCHAR(30) NOT NULL CHECK (
    kategori IN ('listrik', 'air', 'internet', 'maintenance', 'kebersihan', 'gaji', 'perlengkapan', 'lainnya')
  ),
  jumlah NUMERIC(12, 2) NOT NULL CHECK (jumlah >= 0),
  deskripsi TEXT,
  tanggal DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 10. MAINTENANCE (laporan kerusakan & perbaikan)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS maintenance (
  id SERIAL PRIMARY KEY,
  kamar_id INTEGER NOT NULL REFERENCES kamar(id) ON DELETE CASCADE,
  penghuni_id INTEGER REFERENCES penghuni(id) ON DELETE SET NULL,
  masalah TEXT NOT NULL,
  tanggal_laporan DATE NOT NULL DEFAULT CURRENT_DATE,
  prioritas VARCHAR(10) NOT NULL DEFAULT 'sedang' CHECK (prioritas IN ('rendah', 'sedang', 'tinggi')),
  status VARCHAR(20) NOT NULL DEFAULT 'masuk' CHECK (status IN ('masuk', 'diproses', 'diperbaiki', 'selesai')),
  biaya NUMERIC(12, 2) DEFAULT 0 CHECK (biaya >= 0),
  catatan TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 11. AKTIVITAS (log aktivitas untuk feed "Aktivitas Terbaru")
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS aktivitas (
  id SERIAL PRIMARY KEY,
  kos_id INTEGER NOT NULL REFERENCES kos(id) ON DELETE CASCADE,
  tipe VARCHAR(30) NOT NULL, -- contoh: 'pembayaran', 'maintenance', 'penghuni'
  teks TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- INDEX tambahan untuk mempercepat query dashboard
-- ---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_kamar_kos ON kamar(kos_id);
CREATE INDEX IF NOT EXISTS idx_penghuni_kamar ON penghuni(kamar_id);
CREATE INDEX IF NOT EXISTS idx_pembayaran_penghuni ON pembayaran(penghuni_id);
CREATE INDEX IF NOT EXISTS idx_pembayaran_status ON pembayaran(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_kamar ON maintenance(kamar_id);
CREATE INDEX IF NOT EXISTS idx_pengeluaran_kos ON pengeluaran(kos_id);
CREATE INDEX IF NOT EXISTS idx_aktivitas_kos ON aktivitas(kos_id);
