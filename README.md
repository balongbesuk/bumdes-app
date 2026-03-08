# BUMDes App - Simpel Sistem Manajemen Keuangan & Portal Desa

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

## 🚀 Panduan Instalasi (Untuk Pemula)

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi di komputer Anda.

### Langkah 1: Instalasi Perangkat Pendukung
Anda memerlukan **Node.js** terpasang di komputer Anda. 
1. Buka situs [nodejs.org](https://nodejs.org).
2. Download versi **LTS** (Recommended for most users).
3. Jalankan file yang di-download dan ikuti instruksi instalasi sampai selesai.
4. Untuk memastikan sudah terpasang, buka **Command Prompt (CMD)** dan ketik:
   ```bash
   node -v
   ```
   *(Jika muncul angka versi seperti v20.x.x, berarti sudah berhasil).*

### Langkah 2: Download File Aplikasi
Jika Anda tidak menggunakan Git, cukup download script ini sebagai file ZIP (Klik tombol **Code** hijau di Github lalu pilih **Download ZIP**), kemudian ekstrak file tersebut ke dalam folder di komputer Anda.

### Langkah 3: Persiapan Aplikasi & Database
1. Buka folder aplikasi tersebut.
2. Klik kanan di area kosong di dalam folder tersebut, pilih **"Open in Terminal"** atau buka **Command Prompt** lalu arahkan ke folder tersebut.
3. Buat file pengaturan dengan menyalin contoh yang ada:
   - **Windows (CMD):** `copy .env.example .env`
   - **Mac/Linux/Git Bash:** `cp .env.example .env`
4. Ketik perintah berikut satu per satu dan tunggu hingga selesai:
   ```bash
   # Mengunduh modul yang dibutuhkan aplikasi
   npm install

   # Menyiapkan struktur database
   npx prisma generate
   npx prisma db push

   # Mengisi data awal (Data Demo)
   npx prisma db seed
   ```

### Langkah 4: Menjalankan Aplikasi (Release Publik)

Untuk penggunaan publik, presentasi, atau rilis resmi, Anda **wajib** melakukan pengepakan kode (Build) terlebih dahulu agar aplikasi berjalan cepat, aman, dan tanpa indikator pengembangan (seperti logo "N" atau Dev Tools).

1. **Lakukan Pengepakan (Build):**
   ```bash
   npm run build
   ```
   *Tunggu hingga proses selesai (biasanya 1-2 menit).*

2. **Jalankan Versi Produksi:**
   ```bash
   npm run start
   ```

Sekarang, buka browser (Chrome/Edge) dan buka alamat:
**[http://localhost:3000](http://localhost:3000)**

> [!TIP]
> **Mengapa menggunakan `start`, bukan `dev`?**
> - **`npm run dev`**: Hanya digunakan saat mengedit kode (sambil ngoding). Lambat dan menampilkan fitur bantuan developer.
> - **`npm run build` & `npm run start`**: Versi final yang kencang, ringan, dan siap dilihat publik.

---

## 🔐 Akun Login (Demo)
Gunakan akun berikut untuk mencoba fitur-fitur aplikasi:

| Peran | Email | Password |
| :--- | :--- | :--- |
| **Administrator Utama** | `admin@bumdes.com` | `admin123` |
| **Bendahara** | `bendahara@bumdes.com` | `bendahara123` |

---

© 2026 Badan Usaha Milik Desa. Dikembangkan dengan dedikasi untuk kemandirian ekonomi desa.
