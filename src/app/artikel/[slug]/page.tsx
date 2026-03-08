import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, User } from "lucide-react"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const [artikel, profile] = await Promise.all([
    prisma.artikel.findUnique({ where: { slug } }),
    prisma.bumdesProfile.findFirst()
  ])
  
  if (!artikel) return { title: "Artikel Tidak Ditemukan" }
  
  const namaBumdes = profile?.nama || "BUMDes App"
  return {
    title: `${artikel.judul} - ${namaBumdes}`,
    description: artikel.ringkasan || `Baca selengkapnya mengenai ${artikel.judul} di portal resmi ${namaBumdes}.`
  }
}

export default async function ArtikelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  const artikel = await prisma.artikel.findUnique({
    where: { slug },
    include: { author: true }
  })

  if (!artikel || (!artikel.published)) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center mx-auto px-4 md:px-6">
          <Link href="/#berita" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8 md:py-12">
        <article className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
               <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
                 {artikel.kategori}
               </span>
               <span className="flex items-center gap-1 text-sm text-muted-foreground">
                 <Calendar className="w-4 h-4" />
                 {new Date(artikel.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
               </span>
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {artikel.judul}
            </h1>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>Ditulis oleh: {artikel.author.name || "Admin"}</span>
            </div>
          </div>

          {artikel.gambarUrl && (
            <div className="aspect-video w-full rounded-xl overflow-hidden border bg-muted">
              <img src={artikel.gambarUrl} alt={artikel.judul} className="w-full h-full object-cover" />
            </div>
          )}

          <div dangerouslySetInnerHTML={{ __html: artikel.konten.replace(/\n/g, '<br/>') }} className="prose prose-stone dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
          </div>
        </article>
      </main>
    </div>
  )
}
