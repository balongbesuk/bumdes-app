import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Building2, Wallet, ArrowUpRight, ArrowDownRight, CircleDollarSign, AlertCircle } from "lucide-react"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { ProfitChart } from "@/components/dashboard/profit-chart"
import { YearlyGrowthChart } from "@/components/dashboard/yearly-growth-chart"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  const assignedUnitId = session?.user?.unitUsahaId

  // Common queries for stats
  const unitFilter = (role === "pengelola_unit" && assignedUnitId) ? { id: assignedUnitId } : {}
  const transFilter = (role === "pengelola_unit" && assignedUnitId) ? { unitUsahaId: assignedUnitId } : {}

  // 1. Total Unit Usaha Active
  const totalUnits = await prisma.unitUsaha.count({ where: unitFilter })

  // 2. Saldo Summary calculation
  let totalSaldoBumdes = 0
  let totalPemasukanBulanIni = 0
  let totalPengeluaranBulanIni = 0

  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Laba and Setoran Reminder Logic
  const profitData: any[] = []
  const unitsWithoutSetoran: string[] = []

  const unitListAllTime = await prisma.unitUsaha.findMany({
     where: unitFilter,
     include: {
        transaksi: { include: { kategori: true } },
        setoranBumdes: { where: { tanggal: { gte: firstDayOfMonth } } }
     }
  })

  unitListAllTime.forEach(unit => {
     let pemasukan = 0
     let pengeluaran = 0
     unit.transaksi.forEach(t => {
       if (t.kategori.tipe === 'PEMASUKAN') pemasukan += t.jumlah
       else pengeluaran += t.jumlah
     })
     profitData.push({ name: unit.nama, laba: pemasukan - pengeluaran })

     if (unit.setoranBumdes.length === 0) {
        unitsWithoutSetoran.push(unit.nama)
     }
  })

  if (role === 'admin' || role === 'bendahara') {
     // Admin / Bendahara sees total Kas BUMDes
     const kasBumdes = await prisma.kasBumdes.findMany()
      kasBumdes.forEach(k => {
        if (k.tipe === 'PEMASUKAN' || k.tipe === 'SETORAN_UNIT') totalSaldoBumdes += k.jumlah
        else totalSaldoBumdes -= k.jumlah

        if (k.tanggal >= firstDayOfMonth) {
          if (k.tipe === 'PEMASUKAN' || k.tipe === 'SETORAN_UNIT') totalPemasukanBulanIni += k.jumlah
          else totalPengeluaranBulanIni += k.jumlah
        }
      })
  } else {
     // Pengelola Unit sees only their Unit's Saldo and monthly transactions
     const unit = await prisma.unitUsaha.findUnique({ where: { id: assignedUnitId ?? "" } })
     if (unit) totalSaldoBumdes = unit.saldo

     const transactions = await prisma.transaksiUnit.findMany({
       where: { unitUsahaId: assignedUnitId ?? "", tanggal: { gte: firstDayOfMonth } },
       include: { kategori: true }
     })
     transactions.forEach(t => {
       if (t.kategori.tipe === 'PEMASUKAN') totalPemasukanBulanIni += t.jumlah
       else totalPengeluaranBulanIni += t.jumlah
     })
  }

  // 3. Chart Data (Last 6 Months Income/Expense)
  const chartDataMap = new Map<string, { name: string, pemasukan: number, pengeluaran: number }>()
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"]
  
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  // Initialize Map to preserve order and ensure all 6 months exist even if 0
  for (let i = 5; i >= 0; i--) {
     const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
     const key = `${d.getFullYear()}-${d.getMonth()}`
     chartDataMap.set(key, { name: monthNames[d.getMonth()], pemasukan: 0, pengeluaran: 0 })
  }

  if (role === 'admin' || role === 'bendahara') {
      const kData = await prisma.kasBumdes.findMany({
         where: { tanggal: { gte: sixMonthsAgo } }
      })
      kData.forEach(k => {
         const key = `${k.tanggal.getFullYear()}-${k.tanggal.getMonth()}`
         if (chartDataMap.has(key)) {
            const entry = chartDataMap.get(key)!
            if (k.tipe === 'PEMASUKAN' || k.tipe === 'SETORAN_UNIT') entry.pemasukan += k.jumlah
            else entry.pengeluaran += k.jumlah
         }
      })
  } else {
      const tData = await prisma.transaksiUnit.findMany({
         where: { unitUsahaId: assignedUnitId ?? "", tanggal: { gte: sixMonthsAgo } },
         include: { kategori: true }
      })
      tData.forEach(t => {
         const key = `${t.tanggal.getFullYear()}-${t.tanggal.getMonth()}`
         if (chartDataMap.has(key)) {
            const entry = chartDataMap.get(key)!
            if (t.kategori.tipe === 'PEMASUKAN') entry.pemasukan += t.jumlah
            else entry.pengeluaran += t.jumlah
         }
      })
  }

  const chartData = Array.from(chartDataMap.values())

  // 4. Yearly Growth Chart Data (Last 5 Years)
  const yearlyDataMap = new Map<string, { year: string, pemasukan: number, pengeluaran: number }>()
  const startYear = now.getFullYear() - 4 // Last 5 years including current
  for (let i = startYear; i <= now.getFullYear(); i++) {
     yearlyDataMap.set(i.toString(), { year: i.toString(), pemasukan: 0, pengeluaran: 0 })
  }

  const fiveYearsAgo = new Date(startYear, 0, 1)

  if (role === 'admin' || role === 'bendahara') {
      const kYearly = await prisma.kasBumdes.findMany({
         where: { tanggal: { gte: fiveYearsAgo } }
      })
      kYearly.forEach(k => {
         const yKey = k.tanggal.getFullYear().toString()
         if (yearlyDataMap.has(yKey)) {
            const entry = yearlyDataMap.get(yKey)!
            if (k.tipe === 'PEMASUKAN' || k.tipe === 'SETORAN_UNIT') entry.pemasukan += k.jumlah
            else entry.pengeluaran += k.jumlah
         }
      })
  } else {
      const tYearly = await prisma.transaksiUnit.findMany({
         where: { unitUsahaId: assignedUnitId ?? "", tanggal: { gte: fiveYearsAgo } },
         include: { kategori: true }
      })
      tYearly.forEach(t => {
         const yKey = t.tanggal.getFullYear().toString()
         if (yearlyDataMap.has(yKey)) {
            const entry = yearlyDataMap.get(yKey)!
            if (t.kategori.tipe === 'PEMASUKAN') entry.pemasukan += t.jumlah
            else entry.pengeluaran += t.jumlah
         }
      })
  }

  const yearlyChartData = Array.from(yearlyDataMap.values())

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(angka)
  }

  return (
    <div className="space-y-6">
      {unitsWithoutSetoran.length > 0 && (
         <Alert variant="destructive">
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Pengingat Setoran Bulanan</AlertTitle>
           <AlertDescription>
              Terdapat unit usaha yang belum melakukan setoran bulan ini: <strong>{unitsWithoutSetoran.join(", ")}</strong>.
           </AlertDescription>
         </Alert>
      )}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Ringkasan kondisi keuangan {role === 'pengelola_unit' ? 'Unit Usaha Anda' : 'BUMDes'} saat ini.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Saldo */}
        <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
           <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-primary/10 transition-transform group-hover:scale-110" />
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <p className="text-sm font-medium text-muted-foreground">Total Saldo {role === 'pengelola_unit' ? 'Unit' : 'BUMDes'}</p>
                 <h3 className="text-3xl font-bold tracking-tight">{formatRupiah(totalSaldoBumdes)}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                 <Wallet className="h-6 w-6" />
              </div>
           </div>
           <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
              Saldo kumulatif saat ini
           </p>
        </div>

        {/* Card 2: Pemasukan */}
        <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
           <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-green-500/10 transition-transform group-hover:scale-110" />
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <p className="text-sm font-medium text-muted-foreground">Pemasukan Bulan Ini</p>
                 <h3 className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-400">+{formatRupiah(totalPemasukanBulanIni)}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                 <ArrowUpRight className="h-6 w-6" />
              </div>
           </div>
           <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
              Total masuk sejak tanggal 1
           </p>
        </div>

        {/* Card 3: Pengeluaran */}
        <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
           <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-red-500/10 transition-transform group-hover:scale-110" />
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <p className="text-sm font-medium text-muted-foreground">Pengeluaran Bulan Ini</p>
                 <h3 className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">-{formatRupiah(totalPengeluaranBulanIni)}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                 <ArrowDownRight className="h-6 w-6" />
              </div>
           </div>
           <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
              Total keluar sejak tanggal 1
           </p>
        </div>

        {/* Card 4: Dynamic based on role */}
        {(role === 'admin' || role === 'bendahara') ? (
           <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-indigo-500/10 transition-transform group-hover:scale-110" />
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Unit Usaha Aktif</p>
                    <h3 className="text-3xl font-bold tracking-tight">{totalUnits} Unit</h3>
                 </div>
                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
                    <Building2 className="h-6 w-6" />
                 </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
                 Total entitas unit terdaftar
              </p>
           </div>
        ) : (
           <Link href="/setoran-bumdes/tambah" className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-500/50 block">
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-blue-500/10 transition-transform group-hover:scale-110" />
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Setoran ke BUMDes</p>
                    <h3 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 pb-1">Lihat Form</h3>
                 </div>
                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <CircleDollarSign className="h-6 w-6" />
                 </div>
              </div>
              <p className="mt-5 text-xs text-muted-foreground flex items-center gap-1">
                 Gunakan formulir ini rutin tiap bulan
              </p>
           </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Overview Arus Kas (Terakhir)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2 overflow-x-auto pb-4">
            <div className="min-w-[500px]">
              <OverviewChart data={chartData} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Pintasan untuk mencatat transaksi harian.</CardDescription>
          </CardHeader>
           <CardContent className="flex flex-col gap-3">
               {role !== 'pengelola_unit' && (
                  <Link href="/kas-bumdes/tambah" className="group flex items-center gap-3 sm:gap-4 rounded-xl border bg-card p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-primary/50 transition-all">
                      <div className="flex shrink-0 items-center justify-center rounded-full bg-blue-500/10 p-2.5 sm:p-3 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                         <Wallet className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                         <span className="font-semibold text-sm">Catat Kas BUMDes</span>
                         <span className="text-xs text-muted-foreground mt-0.5">Transaksi global & operasional pusat</span>
                      </div>
                  </Link>
               )}
               <Link href="/transaksi-unit/tambah" className="group flex items-center gap-3 sm:gap-4 rounded-xl border bg-card p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-primary/50 transition-all">
                   <div className="flex shrink-0 items-center justify-center rounded-full bg-orange-500/10 p-2.5 sm:p-3 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      <ArrowUpRight className="h-5 w-5" />
                   </div>
                   <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm">Transaksi Unit Usaha</span>
                      <span className="text-xs text-muted-foreground mt-0.5">Catat laba kotor & operasional unit</span>
                   </div>
               </Link>
               <Link href="/setoran-bumdes/tambah" className="group flex items-center gap-3 sm:gap-4 rounded-xl border bg-card p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-primary/50 transition-all">
                   <div className="flex shrink-0 items-center justify-center rounded-full bg-emerald-500/10 p-2.5 sm:p-3 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <CircleDollarSign className="h-5 w-5" />
                   </div>
                   <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm">Penyetoran ke BUMDes</span>
                      <span className="text-xs text-muted-foreground mt-0.5">Transfer saldo unit ke rekening desa</span>
                   </div>
               </Link>
          </CardContent>
        </Card>
      </div>

      {(role === 'admin' || role === 'bendahara') && (
         <div className="grid gap-4 mt-4 lg:grid-cols-2">
           <Card>
             <CardHeader>
               <CardTitle>Statistik Pertumbuhan 5 Tahun</CardTitle>
               <CardDescription>Grafik komparasi pemasukan dan pengeluaran dari tahun ke tahun.</CardDescription>
             </CardHeader>
             <CardContent className="pl-2 overflow-x-auto pb-4">
               <div className="min-w-[500px]">
                 <YearlyGrowthChart data={yearlyChartData} />
               </div>
             </CardContent>
           </Card>

           <Card>
             <CardHeader>
               <CardTitle>Laba Bersih Per Unit Usaha (Kumulatif)</CardTitle>
               <CardDescription>Perbandingan performa laba murni setelah dikurangi pengeluaran operasional.</CardDescription>
             </CardHeader>
             <CardContent className="pl-2 overflow-x-auto pb-4">
               <div className="min-w-[400px]">
                 <ProfitChart data={profitData} />
               </div>
             </CardContent>
           </Card>
         </div>
      )}
    </div>
  )
}
