import { prisma } from "@/lib/prisma"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default async function AuditLogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const resolvedParams = await searchParams
  const currentPage = resolvedParams?.page ? parseInt(resolvedParams.page) : 1
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "admin") {
      redirect("/dashboard")
  }

  const pageSize = 50
  const skip = (currentPage - 1) * pageSize

  const [logs, totalLogs] = await Promise.all([
     prisma.auditLog.findMany({
       include: {
         user: true,
       },
       orderBy: { createdAt: 'desc' },
       skip: skip,
       take: pageSize
     }),
     prisma.auditLog.count()
  ])

  const totalPages = Math.ceil(totalLogs / pageSize)
  
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
           <PaginationLink href={`/settings/audit?page=1`}>1</PaginationLink>
         </PaginationItem>
       )
       if (startPage > 2) {
         pages.push(<PaginationItem key="ellipsis-start"><PaginationEllipsis /></PaginationItem>)
       }
    }

    for (let i = startPage; i <= endPage; i++) {
       pages.push(
         <PaginationItem key={i}>
           <PaginationLink href={`/settings/audit?page=${i}`} isActive={currentPage === i}>
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
           <PaginationLink href={`/settings/audit?page=${totalPages}`}>{totalPages}</PaginationLink>
         </PaginationItem>
       )
    }

    return pages
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Log Sistem</h1>
          <p className="text-muted-foreground">Catatan seluruh aktivitas dan jejak perubahan di dalam sistem BUMDes ({totalLogs.toLocaleString()} total item).</p>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">No.</TableHead>
              <TableHead className="w-[180px]">Waktu</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Tabel Entitas</TableHead>
              <TableHead>Keterangan Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Belum ada catatan log aktivitas.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, index) => (
                <TableRow key={log.id}>
                  <TableCell className="text-center text-muted-foreground">{skip + index + 1}</TableCell>
                  <TableCell className="text-xs">
                    {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(log.createdAt))}
                  </TableCell>
                  <TableCell className="font-medium">{log.user?.email || "Unknown"}</TableCell>
                  <TableCell>
                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        log.action === "CREATE" ? "bg-green-100 text-green-700" :
                        log.action === "UPDATE" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                     }`}>
                        {log.action}
                     </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.entity}</TableCell>
                  <TableCell className="text-sm">{log.details}</TableCell>
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
                 href={currentPage > 1 ? `/settings/audit?page=${currentPage - 1}` : "#"} 
                 className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                 aria-disabled={currentPage <= 1}
               />
             </PaginationItem>
             
             {renderPaginationItems()}
             
             <PaginationItem>
               <PaginationNext 
                 href={currentPage < totalPages ? `/settings/audit?page=${currentPage + 1}` : "#"} 
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
