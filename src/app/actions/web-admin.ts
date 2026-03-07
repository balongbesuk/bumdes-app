"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function createArtikel(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "admin") throw new Error("Unauthorized")

  const judul = formData.get("judul") as string
  const kategori = formData.get("kategori") as string
  const ringkasanInput = formData.get("ringkasan") as string
  const konten = formData.get("konten") as string
  const gambarUrl = formData.get("gambarUrl") as string
  const published = formData.get("published") === "publik"
  const createdAtInput = formData.get("createdAt") as string

  const ringkasan = ringkasanInput || generateRingkasan(konten)

  const slug = await getUniqueSlug(judul)

  await prisma.artikel.create({
    data: {
      judul,
      kategori,
      ringkasan,
      konten,
      gambarUrl: gambarUrl || null,
      published,
      slug,
      authorId: session.user.id,
      createdAt: createdAtInput ? new Date(createdAtInput) : new Date()
    }
  })

  revalidatePath("/")
  revalidatePath("/admin-web/artikel")
  redirect("/admin-web/artikel")
}

export async function getArtikelById(id: string) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "admin") throw new Error("Unauthorized")

  return await prisma.artikel.findUnique({
    where: { id }
  })
}

export async function updateArtikel(id: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "admin") throw new Error("Unauthorized")

  const judul = formData.get("judul") as string
  const kategori = formData.get("kategori") as string
  const ringkasanInput = formData.get("ringkasan") as string
  const konten = formData.get("konten") as string
  const gambarUrl = formData.get("gambarUrl") as string
  const published = formData.get("published") === "publik"
  const createdAtInput = formData.get("createdAt") as string

  const ringkasan = ringkasanInput || generateRingkasan(konten)

  const updateData: any = {
    judul,
    kategori,
    ringkasan,
    konten,
    published,
    createdAt: createdAtInput ? new Date(createdAtInput) : undefined,
    slug: await getUniqueSlug(judul, id)
  }

  if (gambarUrl && gambarUrl !== "gambar-removed") {
    updateData.gambarUrl = gambarUrl
  } else if (gambarUrl === "gambar-removed") {
    updateData.gambarUrl = null
  }

  await prisma.artikel.update({
    where: { id },
    data: updateData
  })

  revalidatePath("/")
  revalidatePath("/admin-web/artikel")
  revalidatePath(`/artikel/${id}`) // slug might have changed but id is same
  redirect("/admin-web/artikel")
}

export async function deleteArtikel(id: string) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "admin") throw new Error("Unauthorized")

  await prisma.artikel.delete({ where: { id } })
  revalidatePath("/")
  revalidatePath("/admin-web/artikel")
}

export async function createPengurus(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "admin") throw new Error("Unauthorized")

  const nama = formData.get("nama") as string
  const jabatan = formData.get("jabatan") as string
  const bio = formData.get("bio") as string
  const fotoUrl = formData.get("fotoUrl") as string
  const urut = parseInt(formData.get("urut") as string) || 0
  const aktif = formData.get("aktif") === "true"

  await prisma.pengurus.create({
    data: {
      nama,
      jabatan,
      bio,
      fotoUrl: fotoUrl || null,
      urut,
      aktif
    }
  })

  revalidatePath("/")
  revalidatePath("/admin-web/pengurus")
  redirect("/admin-web/pengurus")
}

export async function deletePengurus(id: string) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "admin") throw new Error("Unauthorized")

  await prisma.pengurus.delete({ where: { id } })
  revalidatePath("/")
  revalidatePath("/admin-web/pengurus")
}

export async function updatePengurus(id: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "admin") throw new Error("Unauthorized")

  const nama = formData.get("nama") as string
  const jabatan = formData.get("jabatan") as string
  const bio = formData.get("bio") as string
  const fotoUrl = formData.get("fotoUrl") as string
  const urut = parseInt(formData.get("urut") as string) || 0
  const aktif = formData.get("aktif") === "true"

  const updateData: any = {
    nama,
    jabatan,
    bio,
    urut,
    aktif
  }
  
  // if fotoUrl is not 'avatar-removed' and contains base64/url, update it
  if (fotoUrl && fotoUrl !== "avatar-removed") {
    updateData.fotoUrl = fotoUrl
  } else if (fotoUrl === "avatar-removed") {
    updateData.fotoUrl = null
  }

  await prisma.pengurus.update({
    where: { id },
    data: updateData
  })

  revalidatePath("/")
  revalidatePath("/admin-web/pengurus")
  redirect("/admin-web/pengurus")
}

async function getUniqueSlug(title: string, id?: string) {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  if (!baseSlug) baseSlug = 'artikel';

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.artikel.findFirst({
      where: { 
        slug: slug,
        NOT: id ? { id: id } : undefined
      }
    });

    if (!existing) return slug;
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

function generateRingkasan(html: string, length: number = 160) {
  if (!html) return "";
  
  // Simple regex to strip HTML tags
  const text = html.replace(/<[^>]*>?/gm, ' ') // replace tags with space
                   .replace(/\s+/g, ' ')       // collapse multiple spaces
                   .trim();
  
  if (text.length <= length) return text;
  
  return text.substring(0, length).trim() + "...";
}
