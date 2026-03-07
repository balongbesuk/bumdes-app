"use client"

import { ReactNode, useState } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Building2, 
  LayoutDashboard, 
  LogOut, 
  Settings, 
  Tags, 
  Users, 
  Wallet,
  ArrowRightLeft,
  CircleDollarSign,
  FileText,
  Menu,
  X,
  UserCircle,
  Globe,
  Newspaper
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"

interface SidebarLayoutProps {
  children: ReactNode
  user: {
    name?: string | null
    email?: string | null
    role?: string
    unitUsahaId?: string | null
    avatarUrl?: string | null
  }
  bumdesProfile?: any
}

const globalAdminMenu = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Kas BUMDes", href: "/kas-bumdes", icon: Wallet },
  { title: "Setoran BUMDes", href: "/setoran-bumdes", icon: CircleDollarSign },
  { title: "Transaksi Unit", href: "/transaksi-unit", icon: ArrowRightLeft },
  { title: "Laporan Keuangan", href: "/laporan", icon: FileText },
  { title: "Unit Usaha", href: "/unit-usaha", icon: Building2 },
  { title: "Kategori Transaksi", href: "/kategori-transaksi", icon: Tags },
  { title: "Pengguna BUMDes", href: "/users", icon: Users },
  { title: "Pengaturan", href: "/settings", icon: Settings },
  { title: "Admin Web: Berita & Kegiatan", href: "/admin-web/artikel", icon: Newspaper },
  { title: "Admin Web: Pengurus", href: "/admin-web/pengurus", icon: Globe },
]

const bendaharaMenu = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Kas BUMDes", href: "/kas-bumdes", icon: Wallet },
  { title: "Setoran BUMDes", href: "/setoran-bumdes", icon: CircleDollarSign },
  { title: "Laporan Keuangan", href: "/laporan", icon: FileText },
]

const pengelolaMenu = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Transaksi Unit", href: "/transaksi-unit", icon: ArrowRightLeft },
  { title: "Setoran BUMDes", href: "/setoran-bumdes", icon: CircleDollarSign },
]

export function SidebarLayout({ children, user, bumdesProfile }: SidebarLayoutProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  let filteredNavItems = pengelolaMenu
  if (user?.role === "admin") {
    filteredNavItems = globalAdminMenu
  } else if (user?.role === "bendahara") {
    filteredNavItems = bendaharaMenu
  }

  const renderSidebarContent = () => (
    <>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 shrink-0">
        <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
          {bumdesProfile?.logoUrl ? (
             <img src={bumdesProfile.logoUrl} alt="Logo" className="h-6 w-auto max-w-[32px] object-contain" />
          ) : (
             <Building2 className="h-6 w-6 text-primary" />
          )}
          <span className="text-lg truncate max-w-[150px]">{bumdesProfile?.nama || "BUMDes App"}</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4 gap-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard" && item.href !== "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t shrink-0">
         <div className="flex flex-col gap-2 mb-4">
             <div className="flex items-start justify-between">
               <div className="flex items-center gap-3 overflow-hidden">
                 {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Foto Profil" className="w-9 h-9 rounded-full object-cover shrink-0 border" />
                 ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border">
                        <UserCircle className="w-5 h-5" />
                    </div>
                 )}
                 <div className="flex flex-col overflow-hidden">
                   <Link 
                     href="/akun"
                     className="text-sm font-medium truncate pr-2 hover:underline hover:text-primary transition-colors cursor-pointer" 
                     title={`${user?.name || "User"} - Klik untuk edit profil`}
                     onClick={() => setIsMobileMenuOpen(false)}
                   >
                     {user?.name || "User"}
                   </Link>
                   <div className="text-xs text-muted-foreground capitalize truncate pr-2">
                     {user?.role?.replace("_", " ") || "Role"}
                   </div>
                 </div>
               </div>
               <ModeToggle />
             </div>
          </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2" 
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </Button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-muted/40 dark:bg-muted/10 overflow-hidden print:bg-transparent print:h-auto print:overflow-visible print:block">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 md:w-72 flex-col border-r bg-background sm:flex shrink-0 print:hidden">
        {renderSidebarContent()}
      </aside>

      {/* Sidebar Mobile Overlay */}
      {isMobileMenuOpen && (
         <div 
           className="fixed inset-0 bg-black/50 z-40 sm:hidden" 
           onClick={() => setIsMobileMenuOpen(false)} 
         />
      )}

      {/* Sidebar Mobile */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex-col bg-background sm:hidden flex transform transition-transform duration-300 ease-in-out ${
         isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
         <div className="absolute right-4 top-4">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
               <X className="h-5 w-5" />
            </Button>
         </div>
         {renderSidebarContent()}
      </aside>
      
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden print:block print:overflow-visible">
        {/* Mobile Header with Hamburger */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sm:hidden shrink-0 print:hidden">
           <Button variant="outline" size="icon" className="shrink-0" onClick={() => setIsMobileMenuOpen(true)}>
             <Menu className="h-5 w-5" />
             <span className="sr-only">Toggle navigation menu</span>
           </Button>
           <div className="w-full flex justify-end">
              <ModeToggle />
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full max-w-7xl mx-auto print:p-0 print:overflow-visible print:w-full print:max-w-none">
          {children}
        </main>
      </div>
    </div>
  )
}
