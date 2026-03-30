import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isProtected =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/admin")

  if (!req.auth && isProtected) {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.host
    const proto = req.headers.get("x-forwarded-proto") || "https"
    const origin = `${proto}://${host}`
    const loginUrl = new URL("/login", origin)
    return Response.redirect(loginUrl)
  }
})

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
