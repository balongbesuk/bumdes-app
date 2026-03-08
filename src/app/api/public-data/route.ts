import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
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

    return NextResponse.json({
      profile,
      namaBumdes,
      artikelTerbaru,
      heroImages,
      pengurus
    })
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat data publik" }, { status: 500 })
  }
}
