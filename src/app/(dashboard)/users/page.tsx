import { prisma } from "@/lib/prisma"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DeleteButton } from "@/components/delete-button"
import { deleteUser } from "@/app/actions/users"
import { ResetPasswordButton } from "./reset-button"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "admin") {
      redirect("/dashboard")
  }

  const usersList = await prisma.user.findMany({
    include: {
      unitUsaha: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
          <p className="text-muted-foreground">Kelola hak akses dan akun staf BUMDes.</p>
        </div>
        <Link href="/users/tambah">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Pengguna
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">No.</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Peran Akses</TableHead>
              <TableHead>Unit Usaha</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Belum ada data pengguna.
                </TableCell>
              </TableRow>
            ) : (
              usersList.map((u, index) => (
                <TableRow key={u.id}>
                  <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <span className="capitalize">{u.role.replace("_", " ")}</span>
                  </TableCell>
                  <TableCell>
                    {u.unitUsaha ? (
                       <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10">
                          {u.unitUsaha.nama}
                       </span>
                    ) : (
                       <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                     {u.id !== session?.user?.id && (
                        <>
                          <ResetPasswordButton id={u.id} role={u.role} email={u.email} />
                          <DeleteButton id={u.id} action={deleteUser} iconOnly />
                        </>
                     )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
