import { ThemeProvider } from "@/components/theme-provider"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="public-theme"
    >
      {children}
    </ThemeProvider>
  )
}
