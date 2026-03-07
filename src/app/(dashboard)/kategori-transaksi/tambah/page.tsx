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
import { createKategoriTransaksi } from "@/app/actions/kategori-transaksi"
import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

export default function TambahKategoriPage() {
  const [isPending, setIsPending] = useState(false)

  async function actionWrapper(formData: FormData) {
    setIsPending(true)
    const result = await createKategoriTransaksi(formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsPending(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/kategori-transaksi">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Kategori</h1>
          <p className="text-muted-foreground text-sm">Buat kategori transaksi baru.</p>
        </div>
      </div>

      <div className="rounded-md border bg-card p-6">
        <form action={actionWrapper} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Kategori</Label>
            <Input id="nama" name="nama" placeholder="Contoh: Belanja Modal, Pembayaran Listrik" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tipe">Tipe Transaksi</Label>
            <Select name="tipe" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Tipe Transaksi">
                  {(val: string | null) => {
                    if (val === "PEMASUKAN") return "Pemasukan (Menambah Saldo)"
                    if (val === "PENGELUARAN") return "Pengeluaran (Mengurangi Saldo)"
                    return "Pilih Tipe Transaksi"
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PEMASUKAN">Pemasukan (Menambah Saldo)</SelectItem>
                <SelectItem value="PENGELUARAN">Pengeluaran (Mengurangi Saldo)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 flex gap-2 justify-end">
            <Link href="/kategori-transaksi">
              <Button variant="outline" type="button">Batal</Button>
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
