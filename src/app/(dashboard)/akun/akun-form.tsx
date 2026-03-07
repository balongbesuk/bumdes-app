"use client"

import { useActionState, useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updateMyAccount } from "@/app/actions/akun"
import { UserCircle, Upload, Trash } from "lucide-react"

export function AkunForm({ initialData }: { initialData: { name: string, email: string, avatarUrl?: string | null } }) {
  const [state, formAction, isPending] = useActionState(updateMyAccount, null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData.avatarUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    } else if (state?.success) {
      toast.success(state.message)
    }
  }, [state])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Gagal: Ukuran foto maksimal 2MB.")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setAvatarPreview("avatar-removed")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const clientAction = (formData: FormData) => {
    if (avatarPreview) {
      formData.set("avatarUrl", avatarPreview)
    }
    formAction(formData)
  }

  return (
    <div className="max-w-xl bg-card border rounded-lg p-6 shadow-sm">
      <form action={clientAction} className="space-y-6">
        
        <div className="space-y-4">
           {/* Avatar Section */}
           <div className="space-y-3 pb-4 border-b">
             <Label>Foto Profil</Label>
             <div className="flex flex-col sm:flex-row items-center gap-6">
               <div className="flex items-center justify-center w-24 h-24 rounded-full border bg-muted/50 overflow-hidden relative shrink-0">
                  {avatarPreview && avatarPreview !== "avatar-removed" ? (
                    <>
                      <img src={avatarPreview} alt="Preview Foto" className="w-full h-full object-cover" />
                      <div 
                         className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-center cursor-pointer hover:bg-destructive/80 transition-colors"
                         onClick={handleRemoveImage}
                         title="Hapus Foto"
                      >
                         <Trash className="w-4 h-4 text-white mx-auto" />
                      </div>
                    </>
                  ) : (
                    <UserCircle className="w-12 h-12 text-muted-foreground opacity-50" />
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
                     Pilih Foto
                   </Button>
                 </div>
                 <p className="text-xs text-muted-foreground">
                    Format: PNG, JPG (Maks. 2MB). Foto ini akan menggantikan inisial nama Anda di pojok aplikasi.
                 </p>
               </div>
             </div>
           </div>
           <div className="space-y-2">
             <Label htmlFor="name">Nama Lengkap <span className="text-destructive">*</span></Label>
             <Input 
                 id="name" 
                 name="name" 
                 placeholder="Nama Anda" 
                 defaultValue={initialData.name || ""}
                 required 
             />
           </div>
           
           <div className="space-y-2">
             <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
             <Input 
                 id="email" 
                 name="email"
                 type="email" 
                 placeholder="Email Anda" 
                 defaultValue={initialData.email || ""}
                 required
             />
             <p className="text-xs text-muted-foreground">
               Email ini juga digunakan untuk proses login.
             </p>
           </div>
           
           <hr className="my-6 border-muted" />

           <div>
              <h3 className="font-semibold text-sm mb-3 text-foreground/80">Ubah Password (Opsional)</h3>
              <p className="text-xs text-muted-foreground mb-4">
                 Biarkan kosong jika Anda tidak ingin mengubah password saat ini.
              </p>
              
              <div className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="password">Password Baru</Label>
                   <PasswordInput 
                       id="password" 
                       name="password"
                       placeholder="Masukkan password baru" 
                       autoComplete="new-password"
                   />
                 </div>
                 
                 <div className="space-y-2">
                   <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                   <PasswordInput 
                       id="confirmPassword" 
                       name="confirmPassword"
                       placeholder="Ketik ulang password baru" 
                       autoComplete="new-password"
                   />
                 </div>
              </div>
           </div>
        </div>

        <div className="flex justify-end pt-4 border-t gap-3">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Kembali
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Profil Akun"}
          </Button>
        </div>
      </form>
    </div>
  )
}
