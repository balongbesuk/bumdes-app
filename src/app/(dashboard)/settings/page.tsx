import Link from "next/link"
import { ShieldAlert, DatabaseBackup, PackageOpen, Building } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RestoreButton } from "./restore-button"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "admin") {
      redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Sistem</h1>
        <p className="text-muted-foreground">Konfigurasi lanjutan dan fitur keamanan aplikasi BUMDes.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Profil BUMDes Menu */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <Building className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Profil BUMDes</CardTitle>
            <CardDescription>
              Ubah identitas umum, logo resmi, dan informasi legalitas dari BUMDes Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/profil">
               <Button className="w-full">Edit Profil Identitas</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Audit Log Menu */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <ShieldAlert className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>
              Pantau seluruh rekam jejak aktivitas penambahan atau penghapusan dari seluruh pengguna.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/audit">
               <Button variant="secondary" className="w-full">Lihat Rekam Jejak</Button>
            </Link>
          </CardContent>
        </Card>
        
        {/* Database Backup Menu */}
         <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <DatabaseBackup className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Backup Database</CardTitle>
            <CardDescription>
              Unduh salinan berkas SQLite ke perangkat lokal untuk mencegah kehilangan data keuangan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/api/backup" download>
              <Button variant="outline" className="w-full">Download Backup (.db)</Button>
            </a>
          </CardContent>
        </Card>
        {/* Database Restore Menu */}
         <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <PackageOpen className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Restore Database</CardTitle>
            <CardDescription>
              Pulihkan data sistem dari file backup SQLite (`.db`) yang sebelumnya diunduh.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <RestoreButton />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
