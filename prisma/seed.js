const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log("Memulai proses seeding data dummy POSITIF & SEHAT (Presentasi Siap)...")

  // 1. Password hash
  const pAdmin = await bcrypt.hash('admin123', 10)
  const pBendahara = await bcrypt.hash('bendahara123', 10)
  const pPengelola = await bcrypt.hash('pengelola123', 10)

  // 2. Admin & Bendahara
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bumdes.com' },
    update: {},
    create: {
      email: 'admin@bumdes.com',
      name: 'Administrator Utama',
      password: pAdmin,
      role: 'admin',
    },
  })

  await prisma.user.upsert({
    where: { email: 'bendahara@bumdes.com' },
    update: {},
    create: {
      email: 'bendahara@bumdes.com',
      name: 'Ibu Bendahara Desa',
      password: pBendahara,
      role: 'bendahara',
    },
  })

  // 3. Unit Usaha
  const unitsData = [
    { id: 'u1', nama: 'Unit PPOB & Digital', deskripsi: 'Layanan pembayaran tagihan listrik, pulsa, dan tiket.' },
    { id: 'u2', nama: 'Unit Simpan Pinjam', deskripsi: 'Layanan pinjaman modal usaha untuk warga desa.' },
    { id: 'u3', nama: 'Unit Sewa Lahan Pertanian', deskripsi: 'Pengelolaan lahan desa untuk disewakan ke petani.' },
    { id: 'u4', nama: 'Unit Grosir Sembako', deskripsi: 'Penyediaan kebutuhan pokok dengan harga terjangkau.' },
    { id: 'u5', nama: 'Unit Wisata Desa', deskripsi: 'Pengelolaan destinasi wisata alam dan edukasi desa.' }
  ]

  const units = []
  for (const u of unitsData) {
    const created = await prisma.unitUsaha.upsert({
      where: { id: u.id },
      update: {},
      create: { ...u, saldo: 0 }
    })
    units.push(created)
  }

  // 4. Kategori Transaksi
  const categories = [
    { id: 'k1', nama: 'Pendapatan Layanan', tipe: 'PEMASUKAN' },
    { id: 'k2', nama: 'Bagi Hasil Usaha', tipe: 'PEMASUKAN' },
    { id: 'k3', nama: 'Biaya Operasional', tipe: 'PENGELUARAN' },
    { id: 'k4', nama: 'Pembelian Stok Barang', tipe: 'PENGELUARAN' },
    { id: 'k5', nama: 'Gaji Staf Unit', tipe: 'PENGELUARAN' }
  ]

  for (const c of categories) {
    await prisma.kategoriTransaksi.upsert({
      where: { id: c.id },
      update: {},
      create: c
    })
  }

  // 5. Dummy Transaksi Unit & Setoran & Kas
  console.log("Menghasilkan data keuangan POSITIF...")
  const now = new Date()
  
  // Clear existing to ensure fresh state
  await prisma.transaksiUnit.deleteMany({})
  await prisma.setoranBumdes.deleteMany({})
  await prisma.kasBumdes.deleteMany({})
  for (const u of units) {
    await prisma.unitUsaha.update({ where: { id: u.id }, data: { saldo: 0 } })
  }

  // Tracking internal saldo during seed to avoid over-setoran
  const unitSaldi = {}
  units.forEach(u => unitSaldi[u.id] = 0)

  for (let i = 0; i < 150; i++) {
    const randomUnit = units[Math.floor(Math.random() * units.length)]
    
    // BIAS POSITIF: 85% peluang pemasukan, 15% pengeluaran
    const isPemasukan = Math.random() > 0.15 
    
    const category = isPemasukan 
      ? categories.find(c => c.tipe === 'PEMASUKAN') 
      : categories.find(c => c.tipe === 'PENGELUARAN')
    
    // Jumlah pemasukan dibuat lebih besar daripada pengeluaran
    const amount = isPemasukan 
      ? Math.floor(Math.random() * 800000) + 200000 // 200rb - 1jt
      : Math.floor(Math.random() * 150000) + 20000   // 20rb - 170rb
      
    const transactionDate = new Date()
    transactionDate.setDate(now.getDate() - Math.floor(Math.random() * 60))

    await prisma.transaksiUnit.create({
      data: {
        unitUsahaId: randomUnit.id,
        kategoriId: category.id,
        jumlah: amount,
        keterangan: `${category.nama} - Transaksi ke-${i+1}`,
        tanggal: transactionDate
      }
    })

    unitSaldi[randomUnit.id] += isPemasukan ? amount : -amount

    await prisma.unitUsaha.update({
      where: { id: randomUnit.id },
      data: { saldo: { increment: isPemasukan ? amount : -amount } }
    })

    // 6. Generate Setoran: Hanya jika saldo unit cukup banyak (> 2jt)
    // Dan hanya dilakukan setiap 15 iterasi
    if (i % 15 === 0 && unitSaldi[randomUnit.id] > 2000000) {
      const setoranAmount = Math.floor(unitSaldi[randomUnit.id] * 0.4) // Setor 40% dari saldo saat ini
      const setoranDate = new Date(transactionDate)
      setoranDate.setHours(setoranDate.getHours() + 2)

      const setoran = await prisma.setoranBumdes.create({
        data: {
          unitUsahaId: randomUnit.id,
          jumlah: setoranAmount,
          keterangan: `Setoran PAD Desa (Siklus ${i})`,
          tanggal: setoranDate
        }
      })

      await prisma.kasBumdes.create({
        data: {
          tanggal: setoranDate,
          jumlah: setoranAmount,
          tipe: 'SETORAN_UNIT',
          keterangan: `Pemasukan Kas dari Unit ${randomUnit.nama}`,
          setoranId: setoran.id
        }
      })

      unitSaldi[randomUnit.id] -= setoranAmount
      await prisma.unitUsaha.update({
        where: { id: randomUnit.id },
        data: { saldo: { decrement: setoranAmount } }
      })
    }
  }

  // 7. Pengeluaran Kas Utama BUMDes (Dibuat terkontrol agar tetap surplus)
  for (let i = 0; i < 10; i++) {
    const kasDate = new Date()
    kasDate.setDate(now.getDate() - Math.floor(Math.random() * 20))
    const amount = Math.floor(Math.random() * 100000) + 50000

    await prisma.kasBumdes.create({
      data: {
        tanggal: kasDate,
        jumlah: amount,
        tipe: 'PENGELUARAN',
        keterangan: `Biaya ATK/Operasional Kantor BUMDes`
      }
    })
  }

  // 8. Dummy Artikel (Daftar Berita)
  const artikelTitles = [
    "BUMDes Karya Mandiri Raih Omzet 100 Juta",
    "Bantuan Modal Usaha untuk Pedagang Kecil",
    "Pembukaan Destinasi Wisata Embung Desa",
    "Laporan Keuangan Semester I: Surplus!",
    "Modernisasi Sistem Pembayaran PPOB Desa",
    "Kerja Sama Pemasaran Produk UMKM Lokal",
    "Studi Banding Pengelolaan Aset Desa",
    "Pemanfaatan Lahan Tidur Menjadi Produktif",
    "BUMDes Sebagai Pilar Ekonomi Desa Mandiri",
    "Launching Aplikasi Mobile BUMDes Jaya"
  ]

  for (let i = 0; i < artikelTitles.length; i++) {
    const title = artikelTitles[i]
    await prisma.artikel.upsert({
      where: { slug: title.toLowerCase().replace(/ /g, '-') + '-' + i },
      update: {},
      create: {
        judul: title,
        kategori: "Kabar Desa",
        ringkasan: `Keberhasilan BUMDes dalam mengelola unit usaha memberikan dampak positif bagi ekonomi warga...`,
        konten: `<p>Informasi detail mengenai ${title} yang telah dilaksanakan dengan sukses.</p>`,
        published: true,
        slug: title.toLowerCase().replace(/ /g, '-') + '-' + i,
        authorId: admin.id,
        createdAt: new Date(now.getTime() - i * 86400000)
      }
    })
  }

  console.log("Seeding data dummy POSITIF SELESAI! Saldo dijamin SURPLUS untuk presentasi.");
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
