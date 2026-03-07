"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateUnitUsaha } from "@/app/actions/unit-usaha"
import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

export default function EditUnitUsahaForm({ unit }: { unit: any }) {
  const [isPending, setIsPending] = useState(false)

  async function actionWrapper(formData: FormData) {
    setIsPending(true)
    const result = await updateUnitUsaha(unit.id, formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsPending(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/unit-usaha">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Unit Usaha</h1>
          <p className="text-muted-foreground text-sm">Perbarui data unit usaha BUMDes.</p>
        </div>
      </div>

      <div className="rounded-md border bg-card p-6">
        <form action={actionWrapper} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Unit Usaha</Label>
            <Input id="nama" name="nama" defaultValue={unit.nama} placeholder="Contoh: PPOB, Simpan Pinjam" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Input id="deskripsi" name="deskripsi" defaultValue={unit.deskripsi || ""} placeholder="Keterangan singkat (opsional)" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="saldo">Saldo Saat Ini (Rp)</Label>
            <Input 
              id="saldo" 
              name="saldo" 
              type="number" 
              defaultValue={unit.saldo} 
              placeholder="0" 
            />
          </div>

          <div className="pt-4 flex gap-2 justify-end">
            <Button variant="outline" type="button" asChild>
              <Link href="/unit-usaha">Batal</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
