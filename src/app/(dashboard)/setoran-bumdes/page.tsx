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
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DeleteButton } from "@/components/delete-button"
import { deleteSetoranBumdes } from "@/app/actions/setoran-bumdes"
import { SetoranFilter } from "./setoran-filter"
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

export default async function SetoranBumdesPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | undefined }> 
}) {
  const resolvedParams = await searchParams
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  const assignedUnitId = session?.user?.unitUsahaId

  const filterParams: any = {}
  if (role === "pengelola_unit" && assignedUnitId) {
    filterParams.unitUsahaId = assignedUnitId
  } else if (resolvedParams.unit && resolvedParams.unit !== "all") {
    filterParams.unitUsahaId = resolvedParams.unit
  }

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

  const units = role !== "pengelola_unit" ? await prisma.unitUsaha.findMany({
    select: { id: true, nama: true },
    orderBy: { nama: 'asc' }
  }) : []

  const currentPage = resolvedParams?.page ? parseInt(resolvedParams.page as string) : 1
  const pageSize = 50
  const skip = (currentPage - 1) * pageSize

  const [setoranList, totalItems, grandTotalResult] = await Promise.all([
    prisma.setoranBumdes.findMany({
      where: filterParams,
      include: {
        unitUsaha: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: pageSize
    }),
    prisma.setoranBumdes.count({
      where: filterParams
    }),
    prisma.setoranBumdes.aggregate({
      where: filterParams,
      _sum: {
        jumlah: true
      }
    })
  ])

  // Calculate sum for current filtered view (ignoring pagination scope to show accurate total overall filter)
  const totalSetoran = grandTotalResult._sum.jumlah || 0
  const totalPages = Math.ceil(totalItems / pageSize)

  const buildPaginationUrl = (pageNumber: number) => {
    const params = new URLSearchParams()
    if (resolvedParams.bulan) params.set('bulan', resolvedParams.bulan as string)
    if (resolvedParams.tahun) params.set('tahun', resolvedParams.tahun as string)
    if (resolvedParams.unit) params.set('unit', resolvedParams.unit as string)
    params.set('page', pageNumber.toString())
    return `/setoran-bumdes?${params.toString()}`
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
          <h1 className="text-3xl font-bold tracking-tight">Setoran ke BUMDes</h1>
          <p className="text-muted-foreground">Catat dan pantau setoran pendapatan dari unit usaha ke kas utama ({totalItems.toLocaleString()} total item).</p>
        </div>
        <Link href="/setoran-bumdes/tambah">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Catat Setoran Baru
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div className="h-10 text-sm text-muted-foreground flex items-center">Memuat filter...</div>}>
         <SetoranFilter units={units} />
      </Suspense>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">No.</TableHead>
              <TableHead>Tanggal</TableHead>
              {role !== "pengelola_unit" && <TableHead>Dari Unit Usaha</TableHead>}
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-right">Jumlah Setoran</TableHead>
              {role !== "pengelola_unit" && <TableHead className="text-right">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {setoranList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={role !== "pengelola_unit" ? 6 : 4} className="text-center py-8 text-muted-foreground">
                  Belum ada data setoran BUMDes.
                </TableCell>
              </TableRow>
            ) : (
              setoranList.map((s, index) => (
                <TableRow key={s.id}>
                  <TableCell className="text-center text-muted-foreground">{skip + index + 1}</TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(s.tanggal))}
                  </TableCell>
                  {role !== "pengelola_unit" && (
                    <TableCell className="font-medium">{s.unitUsaha.nama}</TableCell>
                  )}
                  <TableCell>{s.keterangan || "-"}</TableCell>
                  <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                    + {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR"
                    }).format(s.jumlah)}
                  </TableCell>
                  {role !== "pengelola_unit" && (
                    <TableCell className="text-right flex justify-end gap-2">
                       <DeleteButton id={s.id} action={deleteSetoranBumdes} iconOnly />
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
            {/* Total Footer */}
            {setoranList.length > 0 && (
              <TableRow className="bg-muted/50 font-bold hover:bg-muted/50">
                 <TableCell colSpan={role !== "pengelola_unit" ? 4 : 2} className="text-right">Total Keseluruhan Filter</TableCell>
                 <TableCell className="text-right text-green-600 dark:text-green-400">
                   {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(totalSetoran)}
                 </TableCell>
                 {role !== "pengelola_unit" && <TableCell></TableCell>}
              </TableRow>
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
