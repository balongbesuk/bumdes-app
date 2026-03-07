import { prisma } from "@/lib/prisma"
import LaporanPage from "./laporan-client"

export default async function LaporanWrapper({ searchParams }: { searchParams: Promise<{ tahun?: string }> }) {
  const resolvedParams = await searchParams
  const currentYear = new Date().getFullYear()
  const tahun = resolvedParams?.tahun ? parseInt(resolvedParams.tahun) : currentYear

  const startDate = new Date(tahun, 0, 1)
  const endDate = new Date(tahun + 1, 0, 1)

  // 1. Fetch Kas BUMDes
  const kas = await prisma.kasBumdes.findMany({
    where: { tanggal: { gte: startDate, lt: endDate } },
    orderBy: { tanggal: 'asc' } // chronological for running balance
  })

  // 2. Fetch Unit Usaha with Aggregates
  const unitsRaw = await prisma.unitUsaha.findMany({
    include: {
      transaksi: {
         where: { tanggal: { gte: startDate, lt: endDate } },
         include: { kategori: true }
      },
      setoranBumdes: {
         where: { tanggal: { gte: startDate, lt: endDate } }
      }
    }
  })

  const unitsAggregated = unitsRaw.map(unit => {
     let pemasukan = 0
     let pengeluaran = 0
     
     unit.transaksi.forEach(t => {
        if (t.kategori.tipe === "PEMASUKAN") pemasukan += t.jumlah
        else pengeluaran += t.jumlah
     })

     const setoran = unit.setoranBumdes.reduce((acc, curr) => acc + curr.jumlah, 0)

     return {
        id: unit.id,
        nama: unit.nama,
        saldo: unit.saldo,
        pemasukan,
        pengeluaran,
        setoran
     }
  })

  // 3. Rekap Laba Otomatis Setiap Bulan
  const monthlyRekap = Array.from({ length: 12 }, (_, i) => ({
     monthIndex: i,
     monthName: new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(tahun, i)),
     pemasukan: 0,
     pengeluaran: 0,
     laba: 0
  }))

  unitsRaw.forEach(unit => {
     unit.transaksi.forEach(t => {
        const month = t.tanggal.getMonth()
        if (t.kategori.tipe === 'PEMASUKAN') {
           monthlyRekap[month].pemasukan += t.jumlah
           monthlyRekap[month].laba += t.jumlah
        } else {
           monthlyRekap[month].pengeluaran += t.jumlah
           monthlyRekap[month].laba -= t.jumlah
        }
     })
  })

  // 4. Fetch Profil BUMDes
  const profil = await prisma.bumdesProfile.findFirst()

  const data = {
     tahun,
     kas,
     units: unitsAggregated,
     monthlyRekap,
     profil
  }

  // Pre-calculate array of years for the filter (e.g. from 2 years ago to next year)
  const availableYears = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]

  return <LaporanPage data={data} availableYears={availableYears} />
}
