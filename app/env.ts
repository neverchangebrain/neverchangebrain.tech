import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
   server: {
      GITHUB_TOKEN: z.string(),
      AUTH_GITHUB_ID: z.string(),
      AUTH_GITHUB_SECRET: z.string(),
      
      GITLAB_TOKEN: z.string(),
      AUTH_GITLAB_ID: z.string(),
      AUTH_GITLAB_SECRET: z.string(),
      
      DATABASE_URL: z.string().url(),
      
      RESEND_API_KEY: z.string(),
   },
   experimental__runtimeEnv: {
      // GITHUB_TOKEN: process.env.GITHUB_TOKEN,
   },
})
