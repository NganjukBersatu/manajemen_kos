# Sistem Manajemen Kos

Struktur proyek dipisah menjadi dua folder independen:

```
kos-management/
├── web/   → Frontend (Vue 3 + Vite + Tailwind CSS)
└── api/   → Backend (Node.js + Express)
```

## Status saat ini (Tahap 1)

Sesuai urutan pengerjaan yang disepakati, tahap ini fokus pada **Dashboard + Sidebar**:

- ✅ Layout dasar (Sidebar + Header)
- ✅ 4 Statistik cards
- ✅ Perlu Perhatian
- ✅ Status Kamar (donut chart)
- ✅ Pembayaran Terbaru (tabel)
- ✅ Grafik Keuangan (6 bulan)
- ✅ Aktivitas Terbaru
- ✅ Responsive mobile (sidebar jadi off-canvas)
- ⏳ Halaman Kamar, Penghuni, Pembayaran, Tagihan, Pengeluaran, Maintenance, Laporan, Pengaturan → baru berupa halaman placeholder, siap dikembangkan di tahap berikutnya
- ⏳ Belum ada database — frontend memakai data contoh di `web/src/data/dummy.js`, backend memakai `api/src/data/dummy.js`

## Menjalankan frontend

```bash
cd web
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Menjalankan backend

```bash
cd api
cp .env.example .env
npm install
npm run dev
```

Cek `http://localhost:4000/api/health`.

Backend sudah punya semua route (`/api/kamar`, `/api/penghuni`, `/api/pembayaran`, `/api/tagihan/listrik`, dst.) tetapi masih mengembalikan data kosong/placeholder — endpoint `/api/dashboard` saja yang sudah mengembalikan data contoh lengkap, sesuai kebutuhan Dashboard.

Frontend **belum** memanggil backend ini (masih pakai data contoh langsung di `web/`). Menyambungkannya adalah langkah lanjutan, setelah database disiapkan.

## Langkah selanjutnya (sesuai roadmap)

1. Bangun halaman **Kamar** (list + tambah/edit kamar)
2. Bangun halaman **Penghuni**
3. Bangun halaman **Pembayaran**
4. Bangun halaman **Tagihan** (Listrik, Air, Internet)
5. Bangun halaman **Pengeluaran**
6. Bangun halaman **Maintenance**
7. Bangun halaman **Laporan**
8. Baru setelah itu: sambungkan ke database, lalu login, notifikasi WhatsApp, dll (V2/V3)
