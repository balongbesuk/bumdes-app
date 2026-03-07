"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createUser } from "@/app/actions/users"
import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

export default function TambahUserForm({ units }: { units: any[] }) {
  const [isPending, setIsPending] = useState(false)
  const [role, setRole] = useState("pengelola_unit")

  async function actionWrapper(formData: FormData) {
    setIsPending(true)
    const result = await createUser(formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsPending(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Pengguna Baru</h1>
          <p className="text-muted-foreground text-sm">Berikan akses ke staf untuk menggunakan aplikasi BUMDes.</p>
        </div>
      </div>

      <div className="rounded-md border bg-card p-6">
        <form action={actionWrapper} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap *</Label>
            <Input id="name" name="name" placeholder="Misal: Budi Santoso" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Login *</Label>
            <Input id="email" name="email" type="email" placeholder="budi@bumdes.com" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password Akses *</Label>
            <PasswordInput id="password" name="password" placeholder="Minimal 6 karakter" required minLength={6} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Peran & Hak Akses *</Label>
            <input type="hidden" name="role" value={role} />
            <Select onValueChange={(val) => setRole(val || "pengelola_unit")} value={role}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Peran">
                   {(val: string | null) => {
                     if (val === "pengelola_unit") return "Pengelola Unit Usaha (Akses Terbatas)"
                     if (val === "bendahara") return "Bendahara BUMDes (Seluruh Kas)"
                     if (val === "admin") return "Administrator (Akses Penuh)"
                     return "Pilih Peran"
                   }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="pengelola_unit">Pengelola Unit Usaha (Akses Terbatas)</SelectItem>
                 <SelectItem value="bendahara">Bendahara BUMDes (Seluruh Kas)</SelectItem>
                 <SelectItem value="admin">Administrator (Akses Penuh)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {role === 'pengelola_unit' && (
             <div className="space-y-2">
               <Label htmlFor="unitUsahaId">Pilih Unit Usaha *</Label>
               <Select name="unitUsahaId" required>
                 <SelectTrigger>
                   <SelectValue placeholder="Pilih Unit Penugasan">
                     {(val: string | null) => {
                        const selectedUnit = units.find(u => u.id === val)
                        return selectedUnit ? selectedUnit.nama : "Pilih Unit Penugasan"
                     }}
                   </SelectValue>
                 </SelectTrigger>
                 <SelectContent>
                   {units.map(unit => (
                     <SelectItem key={unit.id} value={unit.id}>
                       {unit.nama}
                     </SelectItem>
                   ))}
                   {units.length === 0 && <SelectItem value="none" disabled>Tidak ada unit usaha (Buat dulu)</SelectItem>}
                 </SelectContent>
               </Select>
             </div>
          )}

          <div className="pt-4 flex gap-2 justify-end">
            <Link href="/users">
              <Button variant="outline" type="button">Batal</Button>
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan Pengguna"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
