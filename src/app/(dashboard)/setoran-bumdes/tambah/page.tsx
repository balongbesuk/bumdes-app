import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import TambahSetoranForm from "./tambah-form"

export const dynamic = "force-dynamic"

export default async function TambahSetoranBumdesPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  const assignedUnitId = session?.user?.unitUsahaId

  // Filter unit usaha if user is pengelola_unit
  const unitFilter = (role === "pengelola_unit" && assignedUnitId) 
    ? { id: assignedUnitId } 
    : {}

  const units = await prisma.unitUsaha.findMany({
    where: unitFilter,
    orderBy: { nama: 'asc' }
  })

  return <TambahSetoranForm units={units} />
}
