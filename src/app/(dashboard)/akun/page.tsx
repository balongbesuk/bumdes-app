import { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AkunForm } from "./akun-form"
import { UserCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Profil Rekan | BUMDes App",
  description: "Kelola profil pribadi Anda",
}

export default async function AkunPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect("/login")
  }

  // Get freshest info from DB
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Rekan BUMDes</h1>
        <p className="text-muted-foreground">
          Kelola informasi nama dan kata sandi Anda sendiri.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader className="flex flex-row items-center space-x-4 pb-2">
            <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full shrink-0 overflow-hidden">
               {user.avatarUrl ? (
                 <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <UserCircle className="w-6 h-6" />
               )}
            </div>
            <div>
               <CardTitle>Profil Akun: {user.name}</CardTitle>
               <CardDescription>Perbarui data untuk email {user.email}</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
           <AkunForm initialData={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }} />
        </CardContent>
      </Card>
      
    </div>
  )
}
