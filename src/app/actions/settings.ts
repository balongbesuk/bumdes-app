"use server"

import fs from "fs"
import path from "path"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function restoreDatabase(formData: FormData) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user?.role !== "admin") {
    return { error: "Akses Ditolak. Harus merupakan Admin." }
  }

  const file = formData.get("dbFile") as File
  if (!file) {
    return { error: "File database tidak ditemukan." }
  }

  if (!file.name.endsWith(".db")) {
    return { error: "File harus berekstensi .db" }
  }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const dbPath = path.join(process.cwd(), "prisma", "dev.db")
    
    // Write directly over the old database file
    fs.writeFileSync(dbPath, buffer)

    return { success: true }
  } catch (error: any) {
    console.error("Restore DB Error:", error)
    if (error.code === "EBUSY") {
       return { error: "Gagal me-restore. File Database sedang dikunci oleh sistem. Mohon matikan server lalu ganti secara manual." }
    }
    return { error: "Terjadi kesalahan sistem saat me-restore database." }
  }
}
