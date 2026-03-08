"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import fs from "fs"
import path from "path"

async function updateFavicon(base64Data: string | null) {
  try {
    
    if (!base64Data || base64Data === "" || base64Data.startsWith("logo-removed")) {
      return
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
    if (!matches || matches.length !== 3) {
      return
    }

    const buffer = Buffer.from(matches[2], 'base64')
    
    // Write to src/app/favicon.ico
    const srcPath = path.join(process.cwd(), "src/app/favicon.ico")
    fs.writeFileSync(srcPath, buffer)
    
    // Also write to public/favicon.ico if exists or for good measure
    const publicDir = path.join(process.cwd(), "public")
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })
    const publicPath = path.join(publicDir, "favicon.ico")
    fs.writeFileSync(publicPath, buffer)

    console.log(`Favicon updated in src/app and public. Buffer size: ${buffer.length}`)
  } catch (error) {
    console.error("DEBUG: Error in updateFavicon:", error)
  }
}

export async function updateProfilBumdes(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "admin") {
     throw new Error("Unauthorized")
  }

  const nama = formData.get("nama") as string
  const alamat = formData.get("alamat") as string
  const badanHukum = formData.get("badanHukum") as string
  const logoUrl = formData.get("logoUrl") as string
  const faviconUrl = formData.get("faviconUrl") as string
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

  // Update favicon in filesystem: use resized faviconUrl if available, otherwise use finalLogo
  const logoForFavicon = faviconUrl || finalLogo
  if (logoForFavicon && logoForFavicon.startsWith("data:image")) {
    await updateFavicon(logoForFavicon)
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
  revalidatePath("/login")
  revalidatePath("/")
  
  redirect("/settings")
}
