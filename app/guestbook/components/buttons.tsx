"use client"

import { Button } from "@/components/ui/button"
import { Github, Gitlab } from "lucide-react"
import { signIn, signOut } from "next-auth/react"

export function SignIn() {
   return (
     <>
       <Button onClick={async () => signIn("github")}>
         <Github className="mr-2 h-4 w-4" /> log in with github
       </Button>
       <div className="space-y-2"></div>
       <Button onClick={async () => signIn("gitlab")}>
         <Gitlab className="mr-2 h-4 w-4" /> log in with gitlab
       </Button>
     </>
   )

}

export function SignOut() {
   return (
      <Button variant={"outline"} onClick={async () => signOut()}>
         log out
      </Button>
   )
}
