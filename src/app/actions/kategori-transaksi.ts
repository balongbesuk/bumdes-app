"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createKategoriTransaksi(formData: FormData) {
  const nama = formData.get("nama") as string
  const tipe = formData.get("tipe") as string // PEMASUKAN, PENGELUARAN

  if (!nama || !tipe) {
    return { error: "Nama dan Tipe Kategori wajib diisi" }
  }

  try {
    await prisma.kategoriTransaksi.create({
      data: {
        nama,
        tipe,
      }
    })
  } catch (error) {
    return { error: "Gagal menyimpan data kategori transaksi" }
  }

  revalidatePath("/kategori-transaksi")
  redirect("/kategori-transaksi")
}

export async function deleteKategoriTransaksi(id: string) {
  try {
    // Check if category is used
    const inUse = await prisma.transaksiUnit.findFirst({
      where: { kategoriId: id }
    })
    
    if (inUse) {
      return { error: "Kategori sedang digunakan dalam transaksi dan tidak dapat dihapus." }
    }

    await prisma.kategoriTransaksi.delete({
      where: { id }
    })
    revalidatePath("/kategori-transaksi")
    return { success: true }
  } catch (error) {
    return { error: "Gagal menghapus kategori transaksi." }
  }
}
