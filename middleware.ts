import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isProtected =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/admin")

  if (!req.auth && isProtected) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    return Response.redirect(loginUrl)
  }
})

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
