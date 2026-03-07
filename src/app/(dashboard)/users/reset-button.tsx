"use client"

import { Button } from "@/components/ui/button"
import { KeyRound } from "lucide-react"
import { toast } from "sonner"
import { resetUserPassword } from "@/app/actions/users"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ResetPasswordButton({ id, role, email }: { id: string, role: string, email: string }) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleReset = async () => {
    setLoading(true)
    try {
      const res = await resetUserPassword(id)
      if (res?.error) {
        toast.error(`Gagal Mereset: ${res.error}`)
      } else {
        toast.success(`Berhasil direset`, { 
           description: `Password untuk ${email} dikembalikan ke default: ${res.newPassword}`
        })
        setOpen(false)
      }
    } catch (error) {
      toast.error("Terjadi Kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 shrink-0">
          <KeyRound className="h-4 w-4" />
          <span className="hidden sm:inline">Reset Pass</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset Password ke Bawaan?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini akan mengembalikan password pengguna ({email}) ke kata sandi bawaan database dari BUMDes App saat pertama kali diinstal (seperti {role === "admin" ? "admin123" : role === "bendahara" ? "bendahara123" : "pengelola123"}).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <Button onClick={handleReset} disabled={loading} variant="default">
             {loading ? "Mereset..." : "Ya, Reset Password"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
