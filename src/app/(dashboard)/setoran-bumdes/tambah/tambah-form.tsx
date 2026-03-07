"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createSetoranBumdes } from "@/app/actions/setoran-bumdes"
import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

export default function TambahSetoranForm({ units }: { units: any[] }) {
  const [isPending, setIsPending] = useState(false)

  // Set default raw date for input datetime-local
  const today = new Date()
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
  const defaultDate = today.toISOString().slice(0,16)

  async function actionWrapper(formData: FormData) {
    setIsPending(true)
    const result = await createSetoranBumdes(formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsPending(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/setoran-bumdes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catat Setoran Baru</h1>
          <p className="text-muted-foreground text-sm">Transfer uang dari saldo Unit Usaha ke Kas BUMDes.</p>
        </div>
      </div>

      <div className="rounded-md border bg-card p-6">
        <form action={actionWrapper} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tanggal">Tanggal & Waktu Setoran *</Label>
            <Input 
              id="tanggal" 
              name="tanggal" 
              type="datetime-local" 
              defaultValue={defaultDate}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitUsahaId">Dari Unit Usaha *</Label>
            {units.length === 1 ? (
              <>
                <Input 
                  readOnly 
                  disabled 
                  value={`${units[0].nama} (Saldo: Rp ${units[0].saldo.toLocaleString('id-ID')})`} 
                  className="bg-muted cursor-not-allowed text-muted-foreground" 
                />
                <input type="hidden" name="unitUsahaId" value={units[0].id} />
              </>
            ) : (
              <Select name="unitUsahaId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Unit Usaha Sumber Setoran">
                    {(val: string | null) => {
                      if (!val) return "Pilih Unit Usaha Sumber Setoran"
                      const unit = units.find(u => u.id === val)
                      return unit ? `${unit.nama} (Saldo: Rp ${unit.saldo.toLocaleString('id-ID')})` : "Pilih Unit Usaha Sumber Setoran"
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {units.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.nama} (Saldo: Rp {unit.saldo.toLocaleString('id-ID')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jumlah">Jumlah Setoran (Rp) *</Label>
            <Input 
              id="jumlah" 
              name="jumlah" 
              type="number" 
              placeholder="0" 
              min="1"
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan / Berita Acara (opsional)</Label>
            <Input id="keterangan" name="keterangan" placeholder="Contoh: Setoran Laba Bulan Ini" />
          </div>

          <div className="pt-4 flex gap-2 justify-end">
            <Link href="/setoran-bumdes">
              <Button variant="outline" type="button">Batal</Button>
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Memproses..." : "Konfirmasi Setoran"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
