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
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false
      }
      return true
    },
  },
}
