"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Printer, Download } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function LaporanPage({ data, availableYears }: { data: any, availableYears: number[] }) {
  const router = useRouter()
  
  const handleYearChange = (year: string) => {
     router.push(`/laporan?tahun=${year}`)
  }

  const handleExportPDF = () => {
     const doc = new jsPDF()
     const bumdesName = data.profil?.nama || 'BUMDes'
     const bumdesAlamat = data.profil?.alamat ? `Alamat: ${data.profil.alamat}` : ''
     const skName = data.profil?.badanHukum ? `Badan Hukum: ${data.profil.badanHukum}` : ''

     doc.setFontSize(14)
     doc.text(`Laporan Keuangan ${bumdesName} Tahun ${data.tahun}`, 14, 15)
     
     if (skName || bumdesAlamat) {
       doc.setFontSize(10)
       doc.text(`${skName} | ${bumdesAlamat}`, 14, 21)
     }
     
     // 1. Rekap Bulanan
     doc.setFontSize(12)
     doc.text("Rekapitulasi Laba Bulanan", 14, 30)
     autoTable(doc, {
        startY: 35,
        head: [['Bulan', 'Pemasukan', 'Pengeluaran', 'Laba Bersih']],
        body: data.monthlyRekap.map((m: any) => [
           m.monthName,
           m.pemasukan.toLocaleString('id-ID'),
           m.pengeluaran.toLocaleString('id-ID'),
           m.laba.toLocaleString('id-ID')
        ])
     })
     
     let finalY = (doc as any).lastAutoTable.finalY + 15
     
     // 2. Unit Usaha
     doc.text("Laba/Rugi Per Unit Usaha", 14, finalY)
     autoTable(doc, {
        startY: finalY + 5,
        head: [['Unit Usaha', 'Pemasukan', 'Pengeluaran', 'Disetor', 'Saldo Akhir']],
        body: data.units.map((u: any) => [
           u.nama,
           u.pemasukan.toLocaleString('id-ID'),
           u.pengeluaran.toLocaleString('id-ID'),
           u.setoran.toLocaleString('id-ID'),
           u.saldo.toLocaleString('id-ID')
        ])
     })

     finalY = (doc as any).lastAutoTable.finalY + 15

     // 3. Buku Kas Umum
     doc.text("Buku Kas Utama BUMDes", 14, finalY)
     autoTable(doc, {
        startY: finalY + 5,
        head: [['Tanggal', 'Keterangan', 'Pemasukan', 'Pengeluaran', 'Saldo Berjalan']],
        body: data.kas.map((k: any, index: number) => {
           const runningSaldo = data.kas.slice(0, index + 1).reduce((acc: number, curr: any) => {
              const isInc = curr.tipe === "PEMASUKAN" || curr.tipe === "SETORAN_UNIT"
              return isInc ? acc + curr.jumlah : acc - curr.jumlah
           }, 0)
           return [
              new Intl.DateTimeFormat('id-ID', { dateStyle: 'short' }).format(new Date(k.tanggal)),
              k.keterangan || '-',
              (k.tipe === 'PEMASUKAN' || k.tipe === 'SETORAN_UNIT') ? k.jumlah.toLocaleString('id-ID') : '-',
              k.tipe === 'PENGELUARAN' ? k.jumlah.toLocaleString('id-ID') : '-',
              runningSaldo.toLocaleString('id-ID')
           ]
        })
     })
     
     doc.save(`Laporan_BUMDes_${data.tahun}.pdf`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan Keuangan {data.tahun}</h1>
          <p className="text-muted-foreground">{data.profil?.nama || "BUMDes App"} - {data.profil?.badanHukum || "Arus Kas dan Laba Rugi bulanan"}</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap print:hidden">
           <Select onValueChange={handleYearChange} value={data.tahun.toString()}>
              <SelectTrigger className="w-[120px]">
                 <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                 {availableYears.map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                 ))}
              </SelectContent>
           </Select>
           <Button className="gap-2" variant="outline" onClick={handleExportPDF}>
             <Download className="h-4 w-4" />
             Export PDF
           </Button>
           <Button className="gap-2" variant="outline" onClick={() => window.print()}>
             <Printer className="h-4 w-4" />
             Cetak
           </Button>
        </div>
      </div>

      <div className="print:block rounded-md border bg-card p-6 pb-12 space-y-12">
        
        {/* Rekap Bulanan */}
        <div>
           <h2 className="text-xl font-bold mb-6 text-center">Rekapitulasi Laba Tiap Bulan ({data.tahun})</h2>
           <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead className="w-[50px] text-center">No.</TableHead>
                     <TableHead>Bulan</TableHead>
                     <TableHead className="text-right">Pemasukan Global</TableHead>
                     <TableHead className="text-right">Pengeluaran Global</TableHead>
                     <TableHead className="text-right">Laba Bersih</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {data.monthlyRekap.map((m: any, index: number) => (
                     <TableRow key={m.monthIndex}>
                        <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-medium">{m.monthName}</TableCell>
                        <TableCell className="text-right text-green-600">
                           {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(m.pemasukan)}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                           {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(m.pengeluaran)}
                        </TableCell>
                        <TableCell className={`text-right font-bold ${m.laba >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                           {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(m.laba)}
                        </TableCell>
                     </TableRow>
                  ))}
                  {data.monthlyRekap.length === 0 && (
                    <TableRow>
                       <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">Belum ada rekap bulanan</TableCell>
                    </TableRow>
                 )}
               </TableBody>
           </Table>
        </div>

        {/* Laba Rugi Unit Usaha */}
        <div>
           <h2 className="text-xl font-bold mb-6 text-center">Rekap Akumulasi Per Unit Usaha ({data.tahun})</h2>
           <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead className="w-[50px] text-center">No.</TableHead>
                     <TableHead>Unit Usaha</TableHead>
                     <TableHead className="text-right">Total Pemasukan</TableHead>
                     <TableHead className="text-right">Total Pengeluaran</TableHead>
                     <TableHead className="text-right">Total Disetor (BUMDes)</TableHead>
                     <TableHead className="text-right">Saldo Kas Unit Aktif</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {data.units.map((u: any, index: number) => (
                     <TableRow key={u.id}>
                        <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-medium">{u.nama}</TableCell>
                        <TableCell className="text-right text-green-600">
                           {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(u.pemasukan)}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                           {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(u.pengeluaran)}
                        </TableCell>
                        <TableCell className={`text-right ${u.setoran >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                           {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(u.setoran)}
                        </TableCell>
                        <TableCell className={`text-right font-bold ${u.saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                           {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(u.saldo)}
                        </TableCell>
                     </TableRow>
                  ))}
                  {data.units.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">Belum ada Unit Usaha</TableCell>
                     </TableRow>
                  )}
               </TableBody>
           </Table>
        </div>

        {/* Buku Kas BUMDes */}
        <div>
           <h2 className="text-xl font-bold mb-6 text-center">Buku Kas Utama BUMDes ({data.tahun})</h2>
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead className="w-[50px] text-center">No.</TableHead>
                 <TableHead>Tanggal</TableHead>
                 <TableHead>Keterangan</TableHead>
                 <TableHead className="text-right">Pemasukan</TableHead>
                 <TableHead className="text-right">Pengeluaran</TableHead>
                 <TableHead className="text-right">Saldo Berjalan</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {data.kas.map((k: any, index: number) => {
                 const runningSaldo = data.kas.slice(0, index + 1).reduce((acc: number, curr: any) => {
                   const isInc = curr.tipe === "PEMASUKAN" || curr.tipe === "SETORAN_UNIT"
                   return isInc ? acc + curr.jumlah : acc - curr.jumlah
                 }, 0)

                 return (
                   <TableRow key={k.id}>
                     <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                     <TableCell suppressHydrationWarning>
                       {new Intl.DateTimeFormat('id-ID', { dateStyle: 'short' }).format(new Date(k.tanggal))}
                     </TableCell>
                     <TableCell>{k.keterangan}</TableCell>
                     <TableCell className="text-right text-green-600" suppressHydrationWarning>
                       {(k.tipe === "PEMASUKAN" || k.tipe === "SETORAN_UNIT") ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(k.jumlah) : "-"}
                     </TableCell>
                     <TableCell className="text-right text-red-600" suppressHydrationWarning>
                       {k.tipe === "PENGELUARAN" ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(k.jumlah) : "-"}
                     </TableCell>
                     <TableCell 
                       className={`text-right font-medium ${runningSaldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} 
                       suppressHydrationWarning
                     >
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(runningSaldo)}
                     </TableCell>
                   </TableRow>
                 )
               })}
               {data.kas.length === 0 && (
                   <TableRow>
                     <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">Belum ada transaksi di kas utama</TableCell>
                   </TableRow>
               )}
             </TableBody>
           </Table>
        </div>

      </div>
    </div>
  )
}
