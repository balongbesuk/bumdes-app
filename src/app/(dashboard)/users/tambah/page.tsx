import { prisma } from "@/lib/prisma"
import TambahUserForm from "./tambah-form"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function TambahUserPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "admin") {
      redirect("/dashboard")
  }
  
  const units = await prisma.unitUsaha.findMany({
    orderBy: { nama: 'asc' }
  })

  return <TambahUserForm units={units} />
}
