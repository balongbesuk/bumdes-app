"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Image, Upload, Trash } from "lucide-react"
import { toast } from "sonner"
import { updateProfilBumdes } from "@/app/actions/profil"

export function ProfilForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logoUrl || null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resizeImage = (base64Str: string, size: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = document.createElement('img')
      img.src = base64Str
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, size, size)
        resolve(canvas.toDataURL('image/png'))
      }
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Gagal: Ukuran logo maksimal 2MB.")
        return
      }
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string
        setLogoPreview(base64)
        
        // Generate separate 32x32 version for favicon
        const resized = await resizeImage(base64, 32)
        setFaviconPreview(resized)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setLogoPreview("logo-removed") // internal flag to clear logo on server
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function clientAction(formData: FormData) {
    if (logoPreview) {
       formData.set("logoUrl", logoPreview)
    }
    if (faviconPreview) {
       formData.set("faviconUrl", faviconPreview)
    }
    
    setLoading(true)
    try {
      await updateProfilBumdes(formData)
      toast.success("Profil BUMDes berhasil diperbarui.")
    } catch (error: any) {
      if (error?.message?.includes('NEXT_REDIRECT') || error?.message?.includes('NEXT_RESPONSE')) {
        throw error
      }
      toast.error(error.message || "Terjadi kesalahan")
      setLoading(false) // Only stop loading if failed, otherwise it redirects
    }
  }

  return (
    <div className="max-w-2xl bg-card border rounded-lg p-6 shadow-sm">
      <form action={clientAction} className="space-y-6">
        
        {/* Logo Section */}
        <div className="space-y-3">
          <Label>Logo BUMDes</Label>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg bg-muted/50 overflow-hidden relative shrink-0">
               {logoPreview && logoPreview !== "logo-removed" ? (
                 <>
                   <img src={logoPreview} alt="Preview Logo" className="w-full h-full object-contain p-2 bg-white" />
                   <div 
                      className="absolute top-1 right-1 bg-white/80 p-1 rounded-full cursor-pointer hover:bg-destructive text-muted-foreground hover:text-white transition-colors shadow-sm"
                      onClick={handleRemoveImage}
                      title="Hapus Logo"
                   >
                      <Trash className="w-4 h-4" />
                   </div>
                 </>
               ) : (
                 <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2">
                   <Image className="w-8 h-8 opacity-50" />
                   <span className="text-xs">Preview</span>
                 </div>
               )}
            </div>
            
            <div className="space-y-3 flex-1">
              <div className="flex w-full items-center justify-start">
                <Input 
                   type="file" 
                   accept="image/*" 
                   ref={fileInputRef}
                   className="hidden" 
                   onChange={handleFileChange}
                />
                <Button 
                   type="button" 
                   variant="outline" 
                   onClick={() => fileInputRef.current?.click()}
                   className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Unggah Logo Baru
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                 Format disarankan: PNG, JPG (Maksimal 2MB).<br/>Logo ini akan muncul pada kop surat cetak Laporan Keuangan dan navigasi utama.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
           <div className="space-y-2">
             <Label htmlFor="nama">Nama BUMDes <span className="text-destructive">*</span></Label>
             <Input 
                 id="nama" 
                 name="nama" 
                 placeholder="Cth. BUMDes Tirta Jaya" 
                 defaultValue={initialData?.nama || ""}
                 required 
             />
           </div>
           
           <div className="space-y-2">
             <Label htmlFor="badanHukum">Informasi Badan Hukum / SK. Kades</Label>
             <Input 
                 id="badanHukum" 
                 name="badanHukum" 
                 placeholder="Cth. SK. KADES NOMOR : 140 / 71 / KEP / TAHUN 2026" 
                 defaultValue={initialData?.badanHukum || ""}
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="deskripsi">Deskripsi Singkat (Profile)</Label>
             <Textarea 
                 id="deskripsi" 
                 name="deskripsi" 
                 placeholder="Jelaskan secara singkat mengenai visi misi dan profil BUMDes Anda..." 
                 className="min-h-[80px]"
                 defaultValue={initialData?.deskripsi || ""}
             />
             <p className="text-[0.8rem] text-muted-foreground">Deskripsi ini akan dimunculkan pada halaman utama (frontpage) bagian Tentang Kami.</p>
           </div>
           
           <div className="space-y-2">
             <Label htmlFor="alamat">Alamat Lengkap Kantor BUMDes</Label>
             <Textarea 
                 id="alamat" 
                 name="alamat" 
                 placeholder="Nama Jalan, RT/RW, Desa, Kecamatan, Kab/Kota..." 
                 className="min-h-[100px]"
                 defaultValue={initialData?.alamat || ""}
             />
           </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Profil BUMDes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
