import { prisma } from "@/lib/prisma"
import LoginForm from "./login-form"

export default async function LoginPage() {
  const bumdesProfile = await prisma.bumdesProfile.findFirst()

  const artikelDenganGambar = await prisma.artikel.findMany({
    where: { published: true, gambarUrl: { not: null } },
    orderBy: { createdAt: 'desc' },
    select: { gambarUrl: true },
    take: 4,
  })
  
  const heroImages = artikelDenganGambar.map(a => a.gambarUrl as string)

  return <LoginForm bumdesProfile={bumdesProfile} images={heroImages} />
}
