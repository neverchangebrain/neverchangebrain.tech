import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { env } from "@/app/env"

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    GitHub({
      token: env.GITHUB_TOKEN,
      clientId: env.AUTH_GITHUB_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    }),
  ],
})
