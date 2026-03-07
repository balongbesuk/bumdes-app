"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function createTransaksiUnit(formData: FormData) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return { error: "Anda belum login." }
  }

  const tanggalStr = formData.get("tanggal") as string
  const unitUsahaId = formData.get("unitUsahaId") as string
  const kategoriId = formData.get("kategoriId") as string
  const jumlahStr = formData.get("jumlah") as string
  const keterangan = formData.get("keterangan") as string

  if (!tanggalStr || !unitUsahaId || !kategoriId || !jumlahStr) {
    return { error: "Semua kolom wajib diisi kecuali keterangan." }
  }

  const jumlah = parseFloat(jumlahStr)
  if (isNaN(jumlah) || jumlah <= 0) {
    return { error: "Jumlah harus berupa angka positif." }
  }

  const tanggal = new Date(tanggalStr)

  try {
    // Jalankan dalam transaction agar aman (transaksi + update saldo)
    await prisma.$transaction(async (tx) => {
      // 1. Ambil info kategori dan unit usaha untuk tahu info lengkap
      const kategori = await tx.kategoriTransaksi.findUnique({
        where: { id: kategoriId }
      })
      if (!kategori) throw new Error("Kategori tidak valid.")

      const unitUsaha = await tx.unitUsaha.findUnique({
        where: { id: unitUsahaId }
      })
      if (!unitUsaha) throw new Error("Unit usaha tidak valid.")

      // 2. Buat transaksi
      const transaksi = await tx.transaksiUnit.create({
        data: {
          tanggal,
          unitUsahaId,
          kategoriId,
          jumlah,
          keterangan,
        }
      })

      // 3. Update saldo unit
      const multiplier = kategori.tipe === "PEMASUKAN" ? 1 : -1
      await tx.unitUsaha.update({
        where: { id: unitUsahaId },
        data: {
          saldo: { increment: jumlah * multiplier }
        }
      })

      const formattedJumlah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(jumlah)
      // 4. Catat Audit log
      await tx.auditLog.create({
        data: {
          action: "CREATE",
          entity: "TransaksiUnit",
          entityId: transaksi.id,
          userId: session.user.id,
          details: `Mencatat ${kategori.tipe} sebesar ${formattedJumlah} untuk Unit "${unitUsaha.nama}" (${kategori.nama})`
        }
      })
    })

  } catch (error: any) {
    return { error: error.message || "Gagal menyimpan transaksi unit." }
  }

  revalidatePath("/transaksi-unit")
  revalidatePath("/unit-usaha")
  redirect("/transaksi-unit")
}

export async function deleteTransaksiUnit(id: string) {
  const session = await getServerSession(authOptions)
  if (!session) return { error: "Unauthorized" }

  try {
    await prisma.$transaction(async (tx) => {
      // Ambil transaksi yang mau dihapus buat balikin saldonya
      const t = await tx.transaksiUnit.findUnique({
        where: { id },
        include: { kategori: true }
      })

      if (!t) throw new Error("Transaksi tidak ditemukan")

      // Kalau dihapus, efek saldonya berkebalikan
      const multiplier = t.kategori.tipe === "PEMASUKAN" ? -1 : 1
      
      await tx.unitUsaha.update({
        where: { id: t.unitUsahaId },
        data: {
          saldo: { increment: t.jumlah * multiplier }
        }
      })

      await tx.transaksiUnit.delete({
        where: { id }
      })

      const formattedJumlah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(t.jumlah)
      await tx.auditLog.create({
        data: {
          action: "DELETE",
          entity: "TransaksiUnit",
          entityId: id,
          userId: session.user.id,
          details: `Menghapus transaksi ${t.kategori.tipe} sebesar ${formattedJumlah} (${t.kategori.nama})`
        }
      })
    })

    revalidatePath("/transaksi-unit")
    revalidatePath("/unit-usaha")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Gagal menghapus transaksi." }
  }
}
