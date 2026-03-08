"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"
import { HeroSlider } from "@/components/hero-slider"
import Link from "next/link"

export default function LoginForm({ bumdesProfile, images }: { bumdesProfile: any, images: string[] }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const appName = bumdesProfile?.nama || "BUMDes App"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
       setError("Email atau password tidak cocok!")
       setLoading(false)
    } else {
       router.push("/dashboard")
       router.refresh()
    }
  }

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2 bg-background">
      {/* Left Side - Image Slider */}
      <div className="relative hidden lg:block bg-muted overflow-hidden">
        {images.length > 0 ? (
          <HeroSlider images={images} />
        ) : (
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-12 left-12 right-12 z-20">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-foreground drop-shadow-sm">{appName}</h1>
          </div>
          <p className="text-lg text-foreground/80 font-medium max-w-lg mb-2">
            "Membangun kemandirian desa melalui tata kelola usaha yang profesional, transparan, dan inovatif."
          </p>
          <p className="text-sm text-foreground/60">
             © {new Date().getFullYear()} Hak Cipta Dilindungi.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex min-h-screen items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-8 space-y-6">
            {bumdesProfile?.logoUrl ? (
               <img src={bumdesProfile.logoUrl} alt="Logo BUMDes" className="h-20 w-auto object-contain drop-shadow-sm" />
            ) : (
               <div className="rounded-2xl bg-primary/10 p-4">
                 <Building2 className="h-10 w-10 text-primary" />
               </div>
            )}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Login Admin</h1>
              <p className="text-muted-foreground">
                Masukkan kredensial Anda untuk masuk ke sistem.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Admin</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@bumdes.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
               <div className="text-sm text-destructive font-medium my-2 bg-destructive/10 p-3 rounded-md border border-destructive/20">{error}</div>
            )}
            
            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md mt-4" disabled={loading}>
              {loading ? "Memverifikasi..." : "Masuk Sistem"}
            </Button>
          </form>

          <div className="text-center pt-8 border-t mt-8">
             <Button variant="link" asChild className="text-muted-foreground hover:text-primary">
               <Link href="/">
                 ← Kembali ke Halaman Utama
               </Link>
             </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
