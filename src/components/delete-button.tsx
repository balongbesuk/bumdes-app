"use client"

import { Button } from "@/components/ui/button"
import { useTransition, useState } from "react"
import { Trash } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function DeleteButton({ action, id, iconOnly }: { action: (id: string) => Promise<any>, id: string, iconOnly?: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      await action(id)
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger id={`delete-trigger-${id}`} asChild>
        {iconOnly ? (
          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" title="Hapus">
            <Trash className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="destructive" size="sm">Hapus</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus data ini? Tindakan ini permanen dan tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button" disabled={isPending}>
              Batal
            </Button>
          </DialogClose>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isPending}
            type="button"
          >
            {isPending ? "Menghapus..." : "Ya, Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
