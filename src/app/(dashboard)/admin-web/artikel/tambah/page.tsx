"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createArtikel } from "@/app/actions/web-admin"
import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Image as ImageIcon, Trash } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"

export default function TambahArtikelPage() {
  const [isPending, setIsPending] = useState(false)
  const [gambarPreview, setGambarPreview] = useState<string | null>(null)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("Maks 2MB")
      const reader = new FileReader()
      reader.onloadend = () => setGambarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleAction = async (formData: FormData) => {
    setIsPending(true)
    if (gambarPreview) formData.set("gambarUrl", gambarPreview)
    if (date) formData.set("createdAt", date.toISOString().split('T')[0])
    try {
      await createArtikel(formData)
    } catch (error) {
       console.error(error)
       setIsPending(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin-web/artikel">
          <Button variant="ghost" size="icon">
             <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Publikasi Baru</h1>
          <p className="text-muted-foreground text-sm">Tambahkan berita atau kegiatan BUMDes.</p>
        </div>
      </div>

      <div className="rounded-md border bg-card p-6">
        <form action={handleAction} className="space-y-6">
          <div className="grid gap-4">
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="judul">Judul Postingan *</Label>
                 <Input id="judul" name="judul" required placeholder="Judul..." />
               </div>
                <div className="space-y-2">
                  <Label>Tanggal Publikasi *</Label>
                  <DatePicker date={date} setDate={setDate} />
                </div>
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="kategori">Kategori *</Label>
               <Select name="kategori" defaultValue="BERITA">
                 <SelectTrigger>
                   <SelectValue placeholder="Pilih Kategori" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="BERITA">Berita & Informasi</SelectItem>
                   <SelectItem value="KEGIATAN">Kegiatan & Laporan</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             
             <div className="space-y-2">
               <Label>Gambar Utama (Thumbnail)</Label>
               {gambarPreview ? (
                 <div className="relative w-full max-w-sm aspect-video rounded-md overflow-hidden border">
                   <img src={gambarPreview} alt="Preview" className="w-full h-full object-cover" />
                   <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => { setGambarPreview(null); if (fileInputRef.current) fileInputRef.current.value = "" }}>
                     <Trash className="w-4 h-4" />
                   </Button>
                 </div>
               ) : (
                 <div className="flex items-center w-full max-w-sm">
                   <Input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
                 </div>
               )}
             </div>

             <div className="space-y-2">
               <Label htmlFor="ringkasan">Ringkasan (Opsional)</Label>
               <Textarea id="ringkasan" name="ringkasan" placeholder="Teks singkat yang muncul di halaman depan..." rows={2} />
             </div>

             <div className="space-y-2">
               <Label htmlFor="konten">Isi Lengkap Postingan *</Label>
               <Textarea id="konten" name="konten" required placeholder="Tulis rincian berita selengkapnya..." rows={8} />
             </div>

              <div className="space-y-2">
                <Label htmlFor="published">Status Publikasi</Label>
                <Select name="published" defaultValue="publik">
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publik">Langsung Publik</SelectItem>
                    <SelectItem value="draf">Simpan sebagai Draf</SelectItem>
                  </SelectContent>
                </Select>
              </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t">
            <Link href="/admin-web/artikel">
              <Button type="button" variant="outline">Batal</Button>
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Posting Sekarang"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
