import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Trash, UserCircle, Pencil } from "lucide-react"

export default async function PengurusPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "admin") redirect("/dashboard")

  const pengurusList = await prisma.pengurus.findMany({
    orderBy: { urut: "asc" }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profil Pengurus</h1>
          <p className="text-muted-foreground">Kelola anggota kepengurusan BUMDes (Ketua, Sekretaris, Bendahara, Dll).</p>
        </div>
        <Link href="/admin-web/pengurus/tambah">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Tambah Baru
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <div className="w-full overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Foto</th>
                <th className="px-4 py-3 font-medium">Nama / Jabatan</th>
                <th className="px-4 py-3 font-medium">Urutan Tampil</th>
                <th className="px-4 py-3 font-medium">Status Aktif</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pengurusList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Data pengurus kosong.</td>
                </tr>
              ) : (
                pengurusList.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                       <div className="w-10 h-10 rounded-full overflow-hidden border">
                          {item.fotoUrl ? (
                            <img src={item.fotoUrl} alt={item.nama} className="w-full h-full object-cover" />
                          ) : (
                            <UserCircle className="w-full h-full p-1 text-muted-foreground" />
                          )}
                       </div>
                    </td>
                    <td className="px-4 py-3">
                       <p className="font-semibold">{item.nama}</p>
                       <p className="text-muted-foreground text-xs">{item.jabatan}</p>
                    </td>
                    <td className="px-4 py-3 text-center">{item.urut}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.aktif ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                        {item.aktif ? "Ya" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <Link href={`/admin-web/pengurus/${item.id}/edit`}>
                           <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                             <Pencil className="w-4 h-4" />
                           </Button>
                         </Link>
                         <form action={async () => {
                            "use server"
                            const { deletePengurus } = await import("@/app/actions/web-admin")
                            await deletePengurus(item.id)
                         }}>
                           <Button variant="ghost" size="icon" type="submit" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                             <Trash className="w-4 h-4" />
                           </Button>
                         </form>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
