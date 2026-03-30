import type { NextAuthConfig } from "next-auth"

// Edge-compatible auth config (no Prisma, no Node.js-only modules)
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isProtected =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/admin")
      if (isProtected) {
        return isLoggedIn
      }
      return true
    },
  },
}
