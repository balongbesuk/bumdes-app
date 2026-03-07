"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function createSetoranBumdes(formData: FormData) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return { error: "Anda belum login." }
  }

  const tanggalStr = formData.get("tanggal") as string
  const unitUsahaId = formData.get("unitUsahaId") as string
  const jumlahStr = formData.get("jumlah") as string
  const keterangan = formData.get("keterangan") as string

  if (!tanggalStr || !unitUsahaId || !jumlahStr) {
    return { error: "Semua kolom dengan bintang (*) wajib diisi." }
  }

  const jumlah = parseFloat(jumlahStr)
  if (isNaN(jumlah) || jumlah <= 0) {
    return { error: "Jumlah setoran harus berupa angka positif." }
  }

  const tanggal = new Date(tanggalStr)

  try {
    // Transaction handle setoran & balance updates
    await prisma.$transaction(async (tx) => {
      // 1. Cek unit usaha ada?
      const unit = await tx.unitUsaha.findUnique({
        where: { id: unitUsahaId }
      })

      if (!unit) throw new Error("Unit usaha tidak valid.")
      if (unit.saldo < jumlah) {
         throw new Error(`Saldo unit tidak mencukupi (Tersedia: Rp ${unit.saldo.toLocaleString('id-ID')}).`)
      }

      // 2. Buat Setoran
      const setoran = await tx.setoranBumdes.create({
        data: {
          tanggal,
          unitUsahaId,
          jumlah,
          keterangan,
        }
      })

      // 3. Kurangi saldo unit usaha
      await tx.unitUsaha.update({
        where: { id: unitUsahaId },
        data: { saldo: { decrement: jumlah } }
      })

      // 4. Catat ke Kas BUMDes (Pemasukan)
      await tx.kasBumdes.create({
        data: {
          tanggal,
          tipe: "PEMASUKAN",
          jumlah,
          keterangan: `Setoran dari unit usaha: ${unit.nama}${keterangan ? ' - ' + keterangan : ''}`,
          setoranId: setoran.id
        }
      })

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          action: "CREATE",
          entity: "SetoranBumdes",
          entityId: setoran.id,
          userId: session.user.id,
          details: `Setoran sebesar ${jumlah} dari unit ${unit.nama}`
        }
      })
    })

  } catch (error: any) {
    return { error: error.message || "Gagal menyimpan setoran BUMDes." }
  }

  revalidatePath("/setoran-bumdes")
  revalidatePath("/unit-usaha")
  revalidatePath("/kas-bumdes")
  redirect("/setoran-bumdes")
}

export async function deleteSetoranBumdes(id: string) {
  const session = await getServerSession(authOptions)
  if (!session) return { error: "Unauthorized" }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Cek setoran yang mau dihapus
      const setoran = await tx.setoranBumdes.findUnique({
        where: { id }
      })
      if (!setoran) throw new Error("Status setoran tidak ditemukan")

      // 2. Kembalikan saldo unit usaha
      await tx.unitUsaha.update({
        where: { id: setoran.unitUsahaId },
        data: { saldo: { increment: setoran.jumlah } }
      })

      // 3. Catatan Kas BUMDes otomatis terhapus karena on cascade delete (relasi)

      // 4. Hapus setorannya
      await tx.setoranBumdes.delete({
        where: { id }
      })

      // 5. Audit
      await tx.auditLog.create({
        data: {
          action: "DELETE",
          entity: "SetoranBumdes",
          entityId: id,
          userId: session.user.id,
          details: `Deleted setoran: ${setoran.jumlah}`
        }
      })
    })

    revalidatePath("/setoran-bumdes")
    revalidatePath("/unit-usaha")
    revalidatePath("/kas-bumdes")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Gagal menghapus setoran." }
  }
}
