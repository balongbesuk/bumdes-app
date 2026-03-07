"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { restoreDatabase } from "@/app/actions/settings"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function RestoreButton() {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const handleRestore = (formData: FormData) => {
    startTransition(async () => {
      const result = await restoreDatabase(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Database berhasil dipulihkan! Aplikasi akan memuat ulang sesaat lagi.")
        setOpen(false)
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Upload File Restore
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restore Database Lama</DialogTitle>
          <DialogDescription>
            Peringatan: Seluruh data saat ini akan digantikan secara permanen oleh file backup berformat `.db` yang Anda unggah. Pastikan Anda sudah mem-backup data terbaru sebelum mengubahnya.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleRestore} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dbFile">File Database (.db)</Label>
            <Input id="dbFile" name="dbFile" type="file" accept=".db" required />
          </div>

          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button 
               type="submit" 
               variant="destructive"
               disabled={isPending}
            >
              {isPending ? "Sedang Mengimpor..." : "Restore Data"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
