"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createPengurus } from "@/app/actions/web-admin"
import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Trash, UserCircle } from "lucide-react"

export default function TambahPengurusPage() {
  const [isPending, setIsPending] = useState(false)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("Maks 2MB")
      const reader = new FileReader()
      reader.onloadend = () => setFotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleAction = async (formData: FormData) => {
    setIsPending(true)
    if (fotoPreview) formData.set("fotoUrl", fotoPreview)
    try {
      await createPengurus(formData)
    } catch (error) {
       console.error(error)
       setIsPending(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin-web/pengurus">
          <Button variant="ghost" size="icon">
             <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Tambah Pengurus</h1>
          <p className="text-muted-foreground text-sm">Tambahkan profil anggota pengelola operasional BUMDes.</p>
        </div>
      </div>

      <div className="rounded-md border bg-card p-6">
        <form action={handleAction} className="space-y-6">
          <div className="grid gap-4">
             <div className="space-y-2">
               <Label htmlFor="nama">Nama Lengkap *</Label>
               <Input id="nama" name="nama" required placeholder="H. Syaiful Anwar..." />
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="jabatan">Jabatan *</Label>
               <Input id="jabatan" name="jabatan" required placeholder="Ketua BUMDes, Bendahara, dll." />
             </div>
             
             <div className="space-y-3">
               <Label>Foto Pengurus (Opsional)</Label>
               <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border shrink-0 bg-secondary flex items-center justify-center relative">
                     {fotoPreview ? (
                       <>
                         <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                         <div 
                           className="absolute inset-x-0 bottom-0 py-1 bg-black/60 flex justify-center cursor-pointer hover:bg-destructive" 
                           onClick={() => { setFotoPreview(null); if (fileInputRef.current) fileInputRef.current.value = "" }}
                         >
                           <Trash className="w-3 h-3 text-white" />
                         </div>
                       </>
                     ) : (
                       <UserCircle className="w-12 h-12 text-muted-foreground/30" />
                     )}
                  </div>
                  <Input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="max-w-[250px]" />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="urut">No. Urut Tertampil</Label>
                  <Input id="urut" name="urut" type="number" defaultValue={1} min={1} />
                  <p className="text-xs text-muted-foreground">Makin kecil makin di atas (1 = Ketua)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aktif">Status</Label>
                  <Select name="aktif" defaultValue="true">
                    <SelectTrigger>
                      <SelectValue placeholder="Status Aktif" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Aktif</SelectItem>
                      <SelectItem value="false">Nonaktif / Mantan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
             </div>

             <div className="space-y-2">
               <Label htmlFor="bio">Biografi Singkat / Moto (Opsional)</Label>
               <Textarea id="bio" name="bio" placeholder="Bekerja keras membangun desa..." rows={3} />
             </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t">
            <Link href="/admin-web/pengurus">
              <Button type="button" variant="outline">Batal</Button>
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan Profil Pengurus"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
