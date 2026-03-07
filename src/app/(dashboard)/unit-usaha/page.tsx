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
import { Plus, Pencil } from "lucide-react"
import Link from "next/link"
import { DeleteButton } from "@/components/delete-button"
import { deleteUnitUsaha } from "@/app/actions/unit-usaha"

export const dynamic = "force-dynamic"

export default async function UnitUsahaPage() {
  const units = await prisma.unitUsaha.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Unit Usaha</h1>
          <p className="text-muted-foreground">Kelola data unit usaha BUMDes.</p>
        </div>
        <Link href="/unit-usaha/tambah">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Unit
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">No.</TableHead>
              <TableHead>Nama Unit</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Saldo Saat Ini</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Belum ada data unit usaha.
                </TableCell>
              </TableRow>
            ) : (
              units.map((unit, index) => (
                <TableRow key={unit.id}>
                  <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{unit.nama}</TableCell>
                  <TableCell>
                     {unit.deskripsi || "-"}
                  </TableCell>
                  <TableCell className={`font-bold ${unit.saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR"
                    }).format(unit.saldo)}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary" asChild title="Edit">
                      <Link href={`/unit-usaha/${unit.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </Button>
                    <DeleteButton id={unit.id} action={deleteUnitUsaha} iconOnly />
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
