import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import EditUnitUsahaForm from "./edit-form"

export const dynamic = "force-dynamic"

export default async function EditUnitUsahaPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const unit = await prisma.unitUsaha.findUnique({
    where: { id: params.id }
  })

  if (!unit) {
    notFound()
  }

  return <EditUnitUsahaForm unit={unit} />
}
