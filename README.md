# BUMDes App - Sistem Manajemen Keuangan & Portal Desa

Sistem Informasi Manajemen BUMDes adalah aplikasi berbasis web yang dirancang untuk membantu pengelolaan unit usaha desa secara transparan, akuntabel, dan profesional.

## Fitur Utama

- **Dashboard Real-time**: Grafik pertumbuhan laba, arus kas, dan rekapitulasi 5 tahun terakhir.
- **Manajemen Unit Usaha**: Pencatatan transaksi harian dan saldo otomatis tiap unit.
- **Buku Kas Utama**: Pencatatan terpusat aliran kas masuk (pemasukan & setoran unit) dan keluar.
- **Laporan Otomatis**: Generate laporan keuangan tahunan dan detail unit ke format PDF.
- **Portal Publik**: Halaman profil BUMDes, daftar pengurus, dan kabar berita desa untuk masyarakat.
- **Keamanan Berlapis**: Akses berbasis role (Admin, Bendahara, Pengelola Unit) dan Audit Log aktivitas.

## Status Rilis: **v1.0.0 (Public Release)**
*Aplikasi ini telah divalidasi dan siap digunakan untuk kebutuhan operasional maupun presentasi hasil.*

## Teknologi yang Digunakan

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org)
- **Database ORM**: [Prisma](https://prisma.io)
- **Database Engine**: [SQLite](https://sqlite.org)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) & [Shadcn UI](https://ui.shadcn.com)
- **Authentication**: [NextAuth.js](https://next-auth.js.org)
- **Icons**: [Lucide React](https://lucide.dev)

## Cara Menjalankan

### Persiapan
1. Install dependencies:
   ```bash
   npm install
   ```
2. Setup database:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

### Jalankan Mode Pengembangan
```bash
npm run dev
```

### Jalankan Mode Produksi (Rilis Publik)
1. Matikan server pengembangan (`Ctrl+C`).
2. Build aplikasi:
   ```bash
   npm run build
   ```
3. Jalankan server produksi:
   ```bash
   npm run start
   ```

---
© 2026 Badan Usaha Milik Desa. Dikembangkan dengan dedikasi untuk kemandirian ekonomi desa.
