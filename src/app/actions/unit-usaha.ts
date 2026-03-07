"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createUnitUsaha(formData: FormData) {
  const nama = formData.get("nama") as string
  const deskripsi = formData.get("deskripsi") as string
  const saldoAwal = parseFloat(formData.get("saldo") as string) || 0

  if (!nama) {
    return { error: "Nama unit usaha wajib diisi" }
  }

  try {
    const unit = await prisma.unitUsaha.create({
      data: {
        nama,
        deskripsi,
        saldo: saldoAwal,
      }
    })
  } catch (error) {
    return { error: "Gagal menyimpan data unit usaha" }
  }

  revalidatePath("/unit-usaha")
  redirect("/unit-usaha")
}

export async function deleteUnitUsaha(id: string) {
  try {
    await prisma.unitUsaha.delete({
      where: { id }
    })
    revalidatePath("/unit-usaha")
    return { success: true }
  } catch (error) {
    return { error: "Gagal menghapus unit usaha." }
  }
}

export async function updateUnitUsaha(id: string, formData: FormData) {
  const nama = formData.get("nama") as string
  const deskripsi = formData.get("deskripsi") as string
  const saldo = parseFloat(formData.get("saldo") as string) || 0

  if (!nama) {
    return { error: "Nama unit usaha wajib diisi" }
  }

  try {
    await prisma.unitUsaha.update({
      where: { id },
      data: {
        nama,
        deskripsi,
        saldo,
      }
    })
  } catch (error) {
    return { error: "Gagal mengupdate data unit usaha" }
  }

  revalidatePath("/unit-usaha")
  redirect("/unit-usaha")
}
