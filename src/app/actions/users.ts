"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function createUser(formData: FormData) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "admin") {
    return { error: "Akses ditolak. Anda bukan admin." }
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string
  const unitUsahaIdStr = formData.get("unitUsahaId") as string

  if (!name || !email || !password || !role) {
    return { error: "Data wajib tidak lengkap." }
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
       return { error: "Email sudah terdaftar." }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Convert empty string from form to null for Prisma relation
    const unitUsahaId = unitUsahaIdStr ? unitUsahaIdStr : null

    // Validasi spesifik rule
    if (role === 'pengelola_unit' && !unitUsahaId) {
       return { error: "Pengelola unit wajib ditempatkan pada sebuah Unit Usaha." }
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        unitUsahaId
      }
    })

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "User",
        entityId: newUser.id,
        userId: session.user.id,
        details: `Membuat user baru: ${name} (${role})`
      }
    })

  } catch (error: any) {
    return { error: error.message || "Gagal membuat user." }
  }

  revalidatePath("/users")
  redirect("/users")
}

export async function deleteUser(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return { error: "Unauthorized" }

  if (session.user.id === id) {
     return { error: "Anda tidak dapat menghapus akun Anda sendiri." }
  }

  try {
    const deletedUser = await prisma.user.delete({
      where: { id }
    })

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entity: "User",
        entityId: id,
        userId: session.user.id,
        details: `Deleted user: ${deletedUser.email}`
      }
    })

    revalidatePath("/users")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Gagal menghapus user. Pastikan data tidak berelasi." }
  }
}

export async function resetUserPassword(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return { error: "Unauthorized" }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id }})
    if (!targetUser) return { error: "User tidak ditemukan." }

    // Password bawaan mengikuti pola seed database awal: role + '123'
    // contoh: admin123, bendahara123, pengelola123 (untuk pengelola_unit -> kita pakai 'pengelola123')
    let defaultSeedPassword = "user123"
    if (targetUser.role === "admin") defaultSeedPassword = "admin123"
    if (targetUser.role === "bendahara") defaultSeedPassword = "bendahara123"
    if (targetUser.role === "pengelola_unit") defaultSeedPassword = "pengelola123"

    const hashedPassword = await bcrypt.hash(defaultSeedPassword, 10)

    await prisma.user.update({
       where: { id },
       data: { password: hashedPassword }
    })

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "User",
        entityId: id,
        userId: session.user.id,
        details: `Reset password untuk akun: ${targetUser.email} menggunakan password default bawaan`
      }
    })

    revalidatePath("/users")
    return { success: true, newPassword: defaultSeedPassword }
  } catch (error: any) {
    return { error: error.message || "Gagal mereset password." }
  }
}
