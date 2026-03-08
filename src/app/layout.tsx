import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NextAuthProvider } from "@/components/next-auth-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { prisma } from "@/lib/prisma";
import { Toaster } from "@/components/ui/sonner";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await prisma.bumdesProfile.findFirst();
  const namaBumdes = profile?.nama || "BUMDes App";
  const logoUrl = profile?.logoUrl;

  return {
    title: {
      default: "Sistem Informasi Manajemen BUMDes",
      template: `%s - ${namaBumdes}`,
    },
    description: "Aplikasi pengelolaan keuangan, unit usaha, dan laporan laba rugi Badan Usaha Milik Desa yang transparan, akuntabel, dan profesional.",
    icons: {
      icon: logoUrl || "/favicon.ico",
      shortcut: logoUrl || "/favicon.ico",
      apple: logoUrl || "/favicon.ico",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
