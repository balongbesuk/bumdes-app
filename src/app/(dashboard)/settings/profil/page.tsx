import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProfilForm } from "./profil-form"

export const dynamic = "force-dynamic"

export default async function ProfilPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "admin") {
     redirect("/dashboard")
  }

  const profil = await prisma.bumdesProfile.findFirst()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil BUMDes</h1>
        <p className="text-muted-foreground">Isi data dan identitas BUMDes yang akan tampil pada laporan.</p>
      </div>

      <ProfilForm initialData={profil} />
    </div>
  )
}
