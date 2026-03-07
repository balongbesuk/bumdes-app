"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateProfilBumdes(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "admin") {
     throw new Error("Unauthorized")
  }

  const nama = formData.get("nama") as string
  const alamat = formData.get("alamat") as string
  const badanHukum = formData.get("badanHukum") as string
  const logoUrl = formData.get("logoUrl") as string
  const deskripsi = formData.get("deskripsi") as string

  if (!nama) {
     throw new Error("Field Nama wajib diisi")
  }

  const existingProfile = await prisma.bumdesProfile.findFirst()

  let finalLogo = logoUrl
  if (logoUrl && logoUrl.startsWith("logo-removed")) {
      finalLogo = ""
  }

  if (existingProfile) {
     await prisma.bumdesProfile.update({
        where: { id: existingProfile.id },
        data: {
           nama,
           alamat,
           badanHukum,
           deskripsi,
           ...(finalLogo !== null && finalLogo !== undefined && !finalLogo.startsWith("logo-removed") ? { logoUrl: finalLogo } : {}),
           ...(finalLogo === "" ? { logoUrl: "" } : {})
        }
     })
  } else {
     await prisma.bumdesProfile.create({
        data: {
           nama,
           alamat,
           badanHukum,
           deskripsi,
           logoUrl: finalLogo || null
        }
     })
  }

  await prisma.auditLog.create({
      data: {
         action: "UPDATE",
         entity: "BumdesProfile",
         entityId: existingProfile?.id || "NEW",
         details: `Profil BUMDes diperbarui: ${nama}`,
         userId: session.user.id
      }
   })

  revalidatePath("/settings")
  revalidatePath("/settings/profil")
  // also need to revalidate wherever the logo appears, e.g., dashboard
  revalidatePath("/")
  
  redirect("/settings")
}
