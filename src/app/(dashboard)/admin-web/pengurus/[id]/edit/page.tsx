import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import EditPengurusForm from "./edit-form"

export default async function EditPengurusPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "admin") redirect("/dashboard")

  const { id } = await params
  
  const pengurus = await prisma.pengurus.findUnique({
    where: { id }
  })

  if (!pengurus) {
    return notFound()
  }

  return <EditPengurusForm initialData={pengurus} id={id} />
}
