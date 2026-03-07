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
import { createTransaksiUnit } from "@/app/actions/transaksi-unit"
import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

export default function TambahTransaksiForm({ units, categories }: { units: any[], categories: any[] }) {
  const [isPending, setIsPending] = useState(false)

  // Set default raw date for input datetime-local
  const today = new Date()
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
  const defaultDate = today.toISOString().slice(0,16)

  async function actionWrapper(formData: FormData) {
    setIsPending(true)
    const result = await createTransaksiUnit(formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsPending(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/transaksi-unit">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catat Transaksi Baru</h1>
          <p className="text-muted-foreground text-sm">Pemasukan dan pengeluaran unit usaha.</p>
        </div>
      </div>

      <div className="rounded-md border bg-card p-6">
        <form action={actionWrapper} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tanggal">Tanggal & Waktu Transaksi</Label>
            <Input 
              id="tanggal" 
              name="tanggal" 
              type="datetime-local" 
              defaultValue={defaultDate}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitUsahaId">Unit Usaha</Label>
            {units.length === 1 ? (
              <>
                <Input 
                  readOnly 
                  disabled 
                  value={units[0].nama} 
                  className="bg-muted cursor-not-allowed text-muted-foreground" 
                />
                <input type="hidden" name="unitUsahaId" value={units[0].id} />
              </>
            ) : (
              <Select name="unitUsahaId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Unit Usaha">
                    {(val: string | null) => {
                      if (!val) return "Pilih Unit Usaha"
                      const unit = units.find(u => u.id === val)
                      return unit ? unit.nama : "Pilih Unit Usaha"
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {units.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>{unit.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="kategoriId">Kategori Transaksi</Label>
            <Select name="kategoriId" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kategori">
                  {(val: string | null) => {
                    if (!val) return "Pilih Kategori"
                    const kat = categories.find(k => k.id === val)
                    return kat ? `${kat.nama} (${kat.tipe})` : "Pilih Kategori"
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map(kat => (
                  <SelectItem key={kat.id} value={kat.id}>
                    {kat.nama} ({kat.tipe})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jumlah">Jumlah Uang (Rp)</Label>
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
            <Label htmlFor="keterangan">Keterangan</Label>
            <Input id="keterangan" name="keterangan" placeholder="Keterangan transaksi (opsional)" />
          </div>

          <div className="pt-4 flex gap-2 justify-end">
            <Link href="/transaksi-unit">
              <Button variant="outline" type="button">Batal</Button>
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan Transaksi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
