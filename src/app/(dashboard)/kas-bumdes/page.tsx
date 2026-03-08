import { prisma } from "@/lib/prisma"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { DeleteButton } from "@/components/delete-button"
import { deleteKasBumdes } from "@/app/actions/kas-bumdes"
import { KasFilter } from "./kas-filter"
import { Suspense } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export const dynamic = "force-dynamic"

export default async function KasBumdesPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | undefined }> 
}) {
  const resolvedParams = await searchParams
  const filterParams: any = {}
  
  if (resolvedParams.tahun || resolvedParams.bulan) {
    const year = parseInt(resolvedParams.tahun || new Date().getFullYear().toString())
    
    if (resolvedParams.bulan && resolvedParams.bulan !== "all") {
      const month = parseInt(resolvedParams.bulan) - 1 // 0-indexed JS Date
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999) // Last day of month
      filterParams.tanggal = { gte: startDate, lte: endDate }
    } else {
      const startDate = new Date(year, 0, 1)
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999)
      filterParams.tanggal = { gte: startDate, lte: endDate }
    }
  }

  if (resolvedParams.tipe && resolvedParams.tipe !== "all") {
    filterParams.tipe = resolvedParams.tipe as string
  }

  const currentPage = resolvedParams?.page ? parseInt(resolvedParams.page as string) : 1
  const pageSize = 50
  const skip = (currentPage - 1) * pageSize

  const [kasList, totalItems, fullKasList] = await Promise.all([
    prisma.kasBumdes.findMany({
      where: filterParams,
      orderBy: { tanggal: 'desc' },
      skip: skip,
      take: pageSize
    }),
    prisma.kasBumdes.count({
      where: filterParams
    }),
    // Fetch all for saldo calculation (you would ideally use aggregates here instead in production, but for now we mirror previous logic or use sum)
    prisma.kasBumdes.findMany() 
  ])

  // Calculate global saldo BUMDes based on ALL records, regardless of filters, as typically expected for "Saldo Saat Ini"
  let saldoBumdes = 0
  fullKasList.forEach(k => {
    if (k.tipe === "PEMASUKAN" || k.tipe === "SETORAN_UNIT") {
      saldoBumdes += k.jumlah
    } else {
      saldoBumdes -= k.jumlah
    }
  })
  
  const totalPages = Math.ceil(totalItems / pageSize)

  const buildPaginationUrl = (pageNumber: number) => {
    const params = new URLSearchParams()
    if (resolvedParams.bulan) params.set('bulan', resolvedParams.bulan as string)
    if (resolvedParams.tahun) params.set('tahun', resolvedParams.tahun as string)
    if (resolvedParams.tipe) params.set('tipe', resolvedParams.tipe as string)
    params.set('page', pageNumber.toString())
    return `/kas-bumdes?${params.toString()}`
  }

  // Calculate page bounds for UI display
  const renderPaginationItems = () => {
    let pages = []
    let maxVisiblePages = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
       startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    if (startPage > 1) {
       pages.push(
         <PaginationItem key="1">
           <PaginationLink href={buildPaginationUrl(1)}>1</PaginationLink>
         </PaginationItem>
       )
       if (startPage > 2) {
         pages.push(<PaginationItem key="ellipsis-start"><PaginationEllipsis /></PaginationItem>)
       }
    }

    for (let i = startPage; i <= endPage; i++) {
       pages.push(
         <PaginationItem key={i}>
           <PaginationLink href={buildPaginationUrl(i)} isActive={currentPage === i}>
             {i}
           </PaginationLink>
         </PaginationItem>
       )
    }

    if (endPage < totalPages) {
       if (endPage < totalPages - 1) {
          pages.push(<PaginationItem key="ellipsis-end"><PaginationEllipsis /></PaginationItem>)
       }
       pages.push(
         <PaginationItem key={totalPages}>
           <PaginationLink href={buildPaginationUrl(totalPages)}>{totalPages}</PaginationLink>
         </PaginationItem>
       )
    }

    return pages
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kas Utama BUMDes</h1>
          <p className="text-muted-foreground">Catatan arus kas masuk dan keluar rekening utama BUMDes ({totalItems.toLocaleString()} total item terfilter).</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
           <div className={`px-4 py-2 rounded-lg border ${
              saldoBumdes >= 0 
                ? "bg-green-100/50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-900/50 dark:text-green-400" 
                : "bg-red-100/50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-900/50 dark:text-red-400"
           }`}>
              <span className="text-sm opacity-80 mb-1 block">Saldo Saat Ini</span>
              <span className="text-xl font-bold">
                 {saldoBumdes < 0 ? "-" : "+"}{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.abs(saldoBumdes))}
              </span>
           </div>
          <Link href="/kas-bumdes/tambah">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Catat Kas Baru
            </Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<div className="h-10 text-sm text-muted-foreground flex items-center">Memuat filter...</div>}>
         <KasFilter />
      </Suspense>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">No.</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kasList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Belum ada data aliran kas BUMDes.
                </TableCell>
              </TableRow>
            ) : (
              kasList.map((k, index) => (
                <TableRow key={k.id}>
                  <TableCell className="text-center text-muted-foreground">{skip + index + 1}</TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(k.tanggal))}
                  </TableCell>
                  <TableCell>{k.keterangan}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (k.tipe === "PEMASUKAN" || k.tipe === "SETORAN_UNIT") 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {k.tipe.replace("_", " ")}
                      {k.setoranId && " (Dari Unit)"}
                    </span>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${(k.tipe === "PEMASUKAN" || k.tipe === "SETORAN_UNIT") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {(k.tipe === "PEMASUKAN" || k.tipe === "SETORAN_UNIT") ? "+" : "-"} 
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(k.jumlah)}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    {/* Cannot delete if it's tied to Setoran -> Must delete Setoran instead */}
                    {!k.setoranId ? (
                      <DeleteButton id={k.id} action={deleteKasBumdes} iconOnly />
                    ) : (
                      <span className="text-xs text-muted-foreground mt-1 px-2 italic bg-muted rounded">Linked</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
         <Pagination>
           <PaginationContent>
             <PaginationItem>
               <PaginationPrevious 
                 href={currentPage > 1 ? buildPaginationUrl(currentPage - 1) : "#"} 
                 className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                 aria-disabled={currentPage <= 1}
               />
             </PaginationItem>
             
             {renderPaginationItems()}
             
             <PaginationItem>
               <PaginationNext 
                 href={currentPage < totalPages ? buildPaginationUrl(currentPage + 1) : "#"} 
                 className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                 aria-disabled={currentPage >= totalPages}
               />
             </PaginationItem>
           </PaginationContent>
         </Pagination>
      )}
    </div>
  )
}
