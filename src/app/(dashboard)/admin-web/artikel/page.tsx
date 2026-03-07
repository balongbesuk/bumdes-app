import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Trash, Eye, Pencil } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default async function ArtikelPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "admin") redirect("/dashboard")

  const page = Number(searchParams?.page) || 1
  const take = 10
  const skip = (page - 1) * take

  const [articles, totalCount] = await Promise.all([
    prisma.artikel.findMany({
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.artikel.count()
  ])

  const totalPages = Math.ceil(totalCount / take)
  const hasNext = page < totalPages
  const hasPrev = page > 1


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Berita & Kegiatan</h1>
          <p className="text-muted-foreground">Kabar terbaru yang akan muncul di halaman profil depan perusahaan.</p>
        </div>
        <Link href="/admin-web/artikel/tambah">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Tambah Baru
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <div className="w-full overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium w-12">No</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Judul</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Tidak ada artikel.</td>
                </tr>
              ) : (
                articles.map((item: any, index: number) => (
                  <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium">{item.judul}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.kategori}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.published ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                        {item.published ? "Publik" : "Draf"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <Link href={`/artikel/${item.slug}`} target="_blank">
                           <Button variant="ghost" size="icon" title="Lihat Publikasi" className="hover:bg-primary/10 hover:text-primary">
                             <Eye className="w-4 h-4" />
                           </Button>
                         </Link>
                         <Link href={`/admin-web/artikel/${item.id}/edit`}>
                           <Button variant="ghost" size="icon" title="Edit" className="hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600">
                             <Pencil className="w-4 h-4" />
                           </Button>
                         </Link>
                         <form action={async () => {
                            "use server"
                            const { deleteArtikel } = await import("@/app/actions/web-admin")
                            await deleteArtikel(item.id)
                         }}>
                           <Button variant="ghost" size="icon" type="submit" title="Hapus" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                             <Trash className="w-4 h-4" />
                           </Button>
                         </form>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-4 border-t pt-4">
          <PaginationContent>
            {hasPrev ? (
              <PaginationItem>
                <PaginationPrevious href={`/admin-web/artikel?page=${page - 1}`} text="Sebelumnya" />
              </PaginationItem>
            ) : (
              <PaginationItem>
                <PaginationPrevious href="#" text="Sebelumnya" className="pointer-events-none opacity-50" />
              </PaginationItem>
            )}

            {/* Pagination Numbers (simplified) */}
            <span className="text-sm text-muted-foreground px-4">
              Halaman {page} dari {totalPages}
            </span>

            {hasNext ? (
              <PaginationItem>
                <PaginationNext href={`/admin-web/artikel?page=${page + 1}`} text="Selanjutnya" />
              </PaginationItem>
            ) : (
              <PaginationItem>
                <PaginationNext href="#" text="Selanjutnya" className="pointer-events-none opacity-50" />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
