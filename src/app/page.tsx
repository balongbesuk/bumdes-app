import { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, ArrowRight, Newspaper, Users, ChevronRight, Menu } from "lucide-react"
import { ModeToggle } from "@/components/layout/mode-toggle"
import { HeroSlider } from "@/components/hero-slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export const metadata: Metadata = {
  title: "Profil BUMDes - Membangun Desa Mandiri & Sejahtera",
  description: "Portal resmi Badan Usaha Milik Desa. Informasi unit usaha, pengurus, dan kabar terbaru pembangunan ekonomi desa.",
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const profile = await prisma.bumdesProfile.findFirst()
  const namaBumdes = profile?.nama || "BUMDes App"

  // Ambil berita & kegiatan terbaru
  const artikelTerbaru = await prisma.artikel.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
  })

  // Ambil gambar dari artikel terbaru untuk slider (maks. 4)
  const artikelDenganGambar = await prisma.artikel.findMany({
    where: { published: true, gambarUrl: { not: null } },
    orderBy: { createdAt: 'desc' },
    select: { gambarUrl: true },
    take: 4,
  })
  
  const heroImages = artikelDenganGambar.map(a => a.gambarUrl as string)

  // Ambil pengurus aktif
  const pengurus = await prisma.pengurus.findMany({
    where: { aktif: true },
    orderBy: { urut: 'asc' },
  })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar Public */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            {profile?.logoUrl ? (
              <img src={profile.logoUrl} alt="Logo BUMDes" className="h-8 w-auto object-contain" />
            ) : (
              <Building2 className="h-6 w-6 text-primary" />
            )}
            <span className="hidden sm:inline-block truncate max-w-[200px]">{namaBumdes}</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <Link href="#tentang" className="transition-colors hover:text-foreground/80 text-foreground/60">Tentang Kami</Link>
            <Link href="#berita" className="transition-colors hover:text-foreground/80 text-foreground/60">Berita & Kegiatan</Link>
            <Link href="#pengurus" className="transition-colors hover:text-foreground/80 text-foreground/60">Pengurus</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
              <Link href="/login">
                Masuk Sistem
              </Link>
            </Button>
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "icon" })}>
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem>
                    <Link href="#tentang" className="w-full">Tentang Kami</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="#berita" className="w-full">Berita & Kegiatan</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="#pengurus" className="w-full">Pengurus</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="font-medium text-primary">
                    <Link href="/login" className="w-full">Login Admin</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden border-b bg-gradient-to-b from-primary/5 via-background to-background">
          {heroImages.length > 0 && <HeroSlider images={heroImages} />}
          
          {/* Decorative Backgrounds (Fallback or Overlay) */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] opacity-60 pointer-events-none z-0" />
          <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] opacity-50 pointer-events-none z-0" />
          
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-4 max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60 pb-2">
                  Selamat Datang di <span className="text-primary">{namaBumdes}</span>
                </h1>
                <p className="mx-auto max-w-[750px] text-muted-foreground md:text-xl lg:text-2xl font-light leading-relaxed">
                  Membangun kemandirian desa melalui tata kelola usaha yang transparan, profesional, dan inovatif untuk kesejahteraan masyarakat.
                </p>
              </div>
              <div className="space-x-4 pt-4">
                <Button className="h-12 px-8 text-base font-medium shadow-md hover:shadow-lg transition-all" asChild>
                  <Link href="#tentang">Mulai Eksplorasi</Link>
                </Button>
                <Button variant="outline" className="h-12 px-8 text-base font-medium hidden sm:inline-flex" asChild>
                  <Link href="#berita">Kabar Terbaru</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Tentang Kami */}
        <section id="tentang" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <div className="inline-block rounded-full border bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary shadow-sm">
                  Tentang BUMDes
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Profil {namaBumdes}</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed whitespace-pre-line">
                  {profile?.deskripsi || "Kami adalah badan usaha yang seluruh atau sebagian besar modalnya dimiliki oleh Desa melalui penyertaan secara langsung yang berasal dari kekayaan Desa."}
                </p>
                <ul className="space-y-2 py-4">
                  {profile?.alamat && (
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      <span>Alamat: {profile.alamat}</span>
                    </li>
                  )}
                  {profile?.badanHukum && (
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      <span>Legalitas: {profile.badanHukum}</span>
                    </li>
                  )}
                </ul>
              </div>
              <div className="flex justify-center">
                 {profile?.logoUrl ? (
                   <div className="relative group">
                     <div className="absolute -inset-2 bg-gradient-to-r from-primary to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                     <img src={profile.logoUrl} alt="Logo Besar" className="relative w-full max-w-sm rounded-xl object-contain shadow-lg border bg-white p-8 group-hover:scale-[1.02] transition-transform duration-500" />
                   </div>
                 ) : (
                   <div className="w-full max-w-sm aspect-square bg-muted rounded-xl flex items-center justify-center border border-dashed">
                      <Building2 className="w-24 h-24 text-muted-foreground/30" />
                   </div>
                 )}
              </div>
            </div>
          </div>
        </section>

        {/* Berita & Kegiatan */}
        <section id="berita" className="w-full py-12 md:py-24 lg:py-32 bg-slate-50/50 dark:bg-muted/10 border-y">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-3">
                <div className="inline-block rounded-full border bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary shadow-sm">
                  Kabar Terbaru
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Berita & Kegiatan</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Ikuti terus perkembangan dan kegiatan terbaru dari unit-unit usaha kami.
                </p>
              </div>
            </div>
            
            {artikelTerbaru.length > 0 ? (
              <div className="space-y-10">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {artikelTerbaru.map((artikel) => (
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
                <div className="flex justify-center">
                  <Button variant="outline" size="lg" className="rounded-full px-8 shadow-sm hover:shadow-md transition-all gap-2" asChild>
                    <Link href="/artikel">
                      Lihat Semua Berita & Kegiatan
                      <ArrowRight className="w-4 h-4 delay-100" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed rounded-xl bg-background">
                <Newspaper className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-muted-foreground">Belum ada berita atau kegiatan</h3>
                <p className="text-sm text-muted-foreground/80 mt-1">Nantikan pembaruan dari kami selanjutnya.</p>
              </div>
            )}
          </div>
        </section>

        {/* Pengurus */}
        <section id="pengurus" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Susunan Pengurus</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Orang-orang hebat di balik operasional BUMDes kami.
                </p>
              </div>
            </div>
            
            {pengurus.length > 0 ? (
              <div className="relative w-full overflow-hidden py-4 group">
                {/* Gradient Fades for Smooth Illusion */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 max-w-[150px] bg-gradient-to-r from-background to-transparent z-10 transition-colors"></div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 max-w-[150px] bg-gradient-to-l from-background to-transparent z-10 transition-colors"></div>
                
                {/* Marquee Wrapper */}
                <div className="flex w-max animate-marquee gap-6 md:gap-8 hover:pause">
                  {[...pengurus, ...pengurus, ...pengurus].map((p, index) => (
                    <div key={`${p.id}-${index}`} className="flex flex-col items-center space-y-4 text-center w-[230px] md:w-[280px] shrink-0 p-6 rounded-3xl border bg-card/40 hover:bg-card hover:shadow-2xl hover:-translate-y-2 hover:border-primary/20 transition-all duration-500 backdrop-blur-sm">
                      <div className="w-32 h-32 md:w-44 md:h-44 relative rounded-full overflow-hidden border-4 border-muted/50 shadow-inner group-hover/card:border-primary/30 transition-colors">
                        {p.fotoUrl ? (
                          <img src={p.fotoUrl} alt={p.nama} className="object-cover w-full h-full hover:scale-110 transition-transform duration-700 ease-out" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-secondary/80">
                            <Users className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="w-full">
                        <h3 className="text-lg md:text-xl font-bold truncate">{p.nama}</h3>
                        <div className="inline-block mt-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-semibold truncate max-w-full">
                          {p.jabatan}
                        </div>
                        {p.bio && <p className="text-xs text-muted-foreground mt-4 line-clamp-3 leading-relaxed">{p.bio}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-muted-foreground">Data pengurus belum tersedia</h3>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 bg-muted border-t mt-auto">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground" suppressHydrationWarning>
            © {new Date().getFullYear()} {namaBumdes}. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
             <ModeToggle />
             <div className="h-4 w-[1px] bg-border"></div>
             <Link href="/login" className="hover:underline">Login Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
