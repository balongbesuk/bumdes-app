"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function updateMyAccount(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.id) {
    return { error: "Belum login." }
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const avatarUrl = formData.get("avatarUrl") as string

  if (!name || !email) {
    return { error: "Nama dan email wajib diisi." }
  }

  if (password && password !== confirmPassword) {
    return { error: "Password baru dan konfirmasinya tidak sama." }
  }

  try {
    // Pastikan email baru tidak dipakai orang lain
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail && existingEmail.id !== session.user.id) {
      return { error: "Email sudah digunakan oleh akun lain." }
    }

    const dataToUpdate: any = { name, email }

    if (avatarUrl !== null && avatarUrl !== undefined) {
      if (avatarUrl.startsWith("avatar-removed")) {
        dataToUpdate.avatarUrl = null
      } else if (avatarUrl !== "") {
        dataToUpdate.avatarUrl = avatarUrl
      }
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      dataToUpdate.password = hashedPassword
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
    })

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "User",
        entityId: session.user.id,
        userId: session.user.id,
        details: `Memperbarui profil mandiri (Nama: ${name}, Email: ${email})` + (password ? " & password" : ""),
      }
    })

    revalidatePath("/") // Revalidate the root to ensure navbar updates
    revalidatePath("/akun")

    return { success: true, message: "Profil berhasil diperbarui." }
  } catch (error: any) {
    return { error: error.message || "Gagal memperbarui profil." }
  }
}
