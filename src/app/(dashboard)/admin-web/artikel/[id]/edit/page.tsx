import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getArtikelById } from "@/app/actions/web-admin"
import EditArtikelForm from "./edit-form"

export default async function EditArtikelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "admin") redirect("/dashboard")

  const artikel = await getArtikelById(id)
  if (!artikel) notFound()

  return <EditArtikelForm initialData={artikel} id={id} />
}
