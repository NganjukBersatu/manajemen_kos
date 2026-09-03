-- ============================================================
-- SEED DATA AWAL
-- Jalankan SETELAH schema.sql, di Query Tool database manajemen_kos.
-- Ini membuat 1 user pemilik dan 1 baris kos, supaya kamar & penghuni
-- yang ditambahkan lewat API punya kos_id yang valid (id = 1).
-- ============================================================

INSERT INTO users (name, email, password_hash, role)
VALUES ('Pemilik Kos', 'pemilik@kos.local', 'ganti_dengan_hash_asli_nanti', 'owner')
ON CONFLICT (email) DO NOTHING;

INSERT INTO kos (user_id, nama_kos, alamat)
SELECT id, 'Kos Melati', 'Alamat kos kamu di sini'
FROM users
WHERE email = 'pemilik@kos.local'
ON CONFLICT DO NOTHING;

-- Contoh 3 kamar supaya ada data untuk dicoba di endpoint GET /api/kamar
INSERT INTO kamar (kos_id, nomor_kamar, harga, status, fasilitas)
VALUES
  (1, 'A01', 750000, 'kosong', 'Kasur, lemari, kamar mandi dalam'),
  (1, 'A02', 750000, 'kosong', 'Kasur, lemari, kamar mandi dalam'),
  (1, 'A03', 850000, 'kosong', 'Kasur, lemari, AC, kamar mandi dalam')
ON CONFLICT (kos_id, nomor_kamar) DO NOTHING;
