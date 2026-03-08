import { SidebarLayout } from "@/components/layout/sidebar-layout"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ThemeProvider } from "@/components/theme-provider"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  const profile = await prisma.bumdesProfile.findFirst()
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  })
  
  const mergedUser = { ...session.user, ...dbUser }
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="admin-theme"
    >
      <SidebarLayout user={mergedUser} bumdesProfile={profile}>
        {children}
      </SidebarLayout>
    </ThemeProvider>
  )
}

