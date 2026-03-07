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
import { DeleteButton } from "@/components/delete-button"
import { deleteKategoriTransaksi } from "@/app/actions/kategori-transaksi"

export const dynamic = "force-dynamic"

export default async function KategoriTransaksiPage() {
  const categories = await prisma.kategoriTransaksi.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kategori Transaksi</h1>
          <p className="text-muted-foreground">Kelola kategori untuk transaksi Pemasukan dan Pengeluaran Unit Usaha BUMDes.</p>
        </div>
        <Link href="/kategori-transaksi/tambah">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Kategori
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">No.</TableHead>
              <TableHead>Nama Kategori</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Belum ada data kategori transaksi.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category, index) => (
                <TableRow key={category.id}>
                  <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{category.nama}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      category.tipe === "PEMASUKAN" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {category.tipe}
                    </span>
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <DeleteButton id={category.id} action={deleteKategoriTransaksi} iconOnly />
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
