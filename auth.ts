// auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        
        const account = await prisma.account.findFirst({
          where: { userId: user.id, provider: 'google' }
        })
        
        if (account) {
          // @ts-ignore
          session.accessToken = account.access_token
          // @ts-ignore
          session.refreshToken = account.refresh_token
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // After successful sign-in, always redirect to home page
      if (url.startsWith("/")) return url
      if (url.includes("/api/auth")) return baseUrl
      return baseUrl
    },
  },
  session: {
    strategy: "database",
  },
})