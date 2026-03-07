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
import { createKasBumdes } from "@/app/actions/kas-bumdes"
import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

export default function TambahKasForm() {
  const [isPending, setIsPending] = useState(false)

  // Set default raw date for input datetime-local
  const today = new Date()
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
  const defaultDate = today.toISOString().slice(0,16)

  async function actionWrapper(formData: FormData) {
    setIsPending(true)
    const result = await createKasBumdes(formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsPending(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/kas-bumdes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catat Kas BUMDes</h1>
          <p className="text-muted-foreground text-sm">Pencatatan kas masuk atau keluar rekening BUMDes (Non-Unit).</p>
        </div>
      </div>

      <div className="rounded-md border bg-card p-6">
        <form action={actionWrapper} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tanggal">Tanggal & Waktu Transaksi *</Label>
            <Input 
              id="tanggal" 
              name="tanggal" 
              type="datetime-local" 
              defaultValue={defaultDate}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipe">Jenis Arus Kas *</Label>
            <Select name="tipe" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Jenis">
                  {(val: string | null) => {
                    if (val === "PEMASUKAN") return "Uang Masuk (Pemasukan)"
                    if (val === "PENGELUARAN") return "Uang Keluar (Pengeluaran)"
                    return "Pilih Jenis"
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="PEMASUKAN">Uang Masuk (Pemasukan)</SelectItem>
                 <SelectItem value="PENGELUARAN">Uang Keluar (Pengeluaran)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jumlah">Jumlah (Rp) *</Label>
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
            <Label htmlFor="keterangan">Keterangan / Berita Acara *</Label>
            <Input id="keterangan" name="keterangan" placeholder="Contoh: Bunga bank, Biaya admin, Bantuan desa" required />
          </div>

          <div className="pt-4 flex gap-2 justify-end">
            <Link href="/kas-bumdes">
              <Button variant="outline" type="button">Batal</Button>
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Memproses..." : "Simpan Uang Kas"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
