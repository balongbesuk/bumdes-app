import { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Newspaper, ArrowRight, ArrowLeft } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export const metadata: Metadata = {
  title: "Index Berita & Kegiatan - BUMDes",
  description: "Daftar seluruh berita dan kegiatan yang telah diterbitkan oleh BUMDes.",
}

export default async function ArtikelIndexPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams
  const page = Number(searchParams?.page) || 1
  const take = 12 // 3x4 grid or 4x3 grid fits nicely
  const skip = (page - 1) * take

  const [semuaArtikel, totalCount] = await Promise.all([
    prisma.artikel.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.artikel.count({ where: { published: true } })
  ])

  const totalPages = Math.ceil(totalCount / take)
  const hasNext = page < totalPages
  const hasPrev = page > 1

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center mx-auto px-4 md:px-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Link>
          </Button>
          <h1 className="text-lg font-bold">Index Berita BUMDes</h1>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
           <div className="space-y-3">
             <div className="inline-block rounded-full border bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary shadow-sm">
               Kumpulan Artikel
             </div>
             <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Semua Berita & Kegiatan</h2>
             <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
               Daftar seluruh publikasi yang telah kami terbitkan untuk transparansi dan informasi publik.
             </p>
           </div>
        </div>

        {semuaArtikel.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {semuaArtikel.map((artikel) => (
              <Card key={artikel.id} className="overflow-hidden flex flex-col transition-all hover:shadow-md">
                <div className="aspect-video w-full bg-muted relative">
                  {artikel.gambarUrl ? (
                    <img src={artikel.gambarUrl} alt={artikel.judul} className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-secondary/50">
                      <Newspaper className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                    {artikel.kategori}
                  </div>
                </div>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="text-xs text-muted-foreground mb-2" suppressHydrationWarning>
                    {new Date(artikel.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <h3 className="text-xl font-bold leading-tight mb-2 line-clamp-2">{artikel.judul}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                    {artikel.ringkasan || "Klik di bawah untuk membaca lebih lanjut."}
                  </p>
                  <Button variant="ghost" className="w-fit p-0 h-auto hover:bg-transparent hover:text-primary gap-1 font-semibold group mt-auto" asChild>
                    <Link href={`/artikel/${artikel.slug}`}>
                      Baca Selengkapnya
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed rounded-xl bg-background">
            <Newspaper className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-muted-foreground">Belum ada berita atau kegiatan</h3>
            <p className="text-sm text-muted-foreground/80 mt-1">Belum ada publikasi yang diterbitkan.</p>
          </div>
        )}

        {totalPages > 1 && (
          <Pagination className="mt-12">
            <PaginationContent>
              {hasPrev ? (
                <PaginationItem>
                  <PaginationPrevious href={`/artikel?page=${page - 1}`} text="Sebelumnya" />
                </PaginationItem>
              ) : (
                <PaginationItem>
                  <PaginationPrevious href="#" text="Sebelumnya" className="pointer-events-none opacity-50" />
                </PaginationItem>
              )}

              <span className="text-sm text-muted-foreground px-4">
                Halaman {page} dari {totalPages}
              </span>

              {hasNext ? (
                <PaginationItem>
                  <PaginationNext href={`/artikel?page=${page + 1}`} text="Selanjutnya" />
                </PaginationItem>
              ) : (
                <PaginationItem>
                  <PaginationNext href="#" text="Selanjutnya" className="pointer-events-none opacity-50" />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        )}
      </main>
    </div>
  )
}
