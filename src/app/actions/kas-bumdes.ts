"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function createKasBumdes(formData: FormData) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return { error: "Anda belum login." }
  }

  const tanggalStr = formData.get("tanggal") as string
  const tipe = formData.get("tipe") as string // PEMASUKAN / PENGELUARAN
  const jumlahStr = formData.get("jumlah") as string
  const keterangan = formData.get("keterangan") as string

  if (!tanggalStr || !tipe || !jumlahStr || !keterangan) {
    return { error: "Semua kolom wajib diisi." }
  }

  const jumlah = parseFloat(jumlahStr)
  if (isNaN(jumlah) || jumlah <= 0) {
    return { error: "Jumlah kas harus berupa angka positif." }
  }

  const tanggal = new Date(tanggalStr)

  try {
    const kas = await prisma.kasBumdes.create({
      data: {
        tanggal,
        tipe,
        jumlah,
        keterangan,
      }
    })

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "KasBumdes",
        entityId: kas.id,
        userId: session.user.id,
        details: `Transaksi Kas BUMDes ${tipe} sebesar ${jumlah}`
      }
    })

  } catch (error: any) {
    return { error: error.message || "Gagal menyimpan transaksi Kas BUMDes." }
  }

  revalidatePath("/kas-bumdes")
  redirect("/kas-bumdes")
}

export async function deleteKasBumdes(id: string) {
  const session = await getServerSession(authOptions)
  if (!session) return { error: "Unauthorized" }

  try {
    await prisma.$transaction(async (tx) => {
      const kas = await tx.kasBumdes.findUnique({ where: { id } })
      if (!kas) throw new Error("Transaksi Kas tidak ditemukan")
      
      if (kas.setoranId) {
        throw new Error("Tidak dapat menghapus Kas yang berasal dari Setoran Unit. Hapus langsung di menu Setoran BUMDes.")
      }

      await tx.kasBumdes.delete({
        where: { id }
      })

      await tx.auditLog.create({
        data: {
          action: "DELETE",
          entity: "KasBumdes",
          entityId: id,
          userId: session.user.id,
          details: `Deleted Kas BUMDes: ${kas.jumlah} (${kas.tipe})`
        }
      })
    })

    revalidatePath("/kas-bumdes")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Gagal menghapus transaksi Kas BUMDes." }
  }
}
