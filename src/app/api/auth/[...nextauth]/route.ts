import NextAuth from "next-auth"
import { authOptions } from "../../../../lib/auth"

export async function GET(request: Request, context: any) {
  return NextAuth(authOptions)(request, context)
}

export async function POST(request: Request, context: any) {
  return NextAuth(authOptions)(request, context)
}
