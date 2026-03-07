import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import * as fs from "fs"
import * as path from "path"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user?.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const dbPath = path.join(process.cwd(), "prisma", "dev.db")
    
    if (!fs.existsSync(dbPath)) {
      return new NextResponse("Database file not found", { status: 404 })
    }

    const fileBuffer = fs.readFileSync(dbPath)
    
    const date = new Date().toISOString().split('T')[0]
    const fileName = `bumdes_backup_${date}.db`

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("Backup error:", error)
    return new NextResponse("Failed to download backup", { status: 500 })
  }
}
