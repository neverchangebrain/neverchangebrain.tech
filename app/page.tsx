import { Cards } from "@/components/cards"
import { Heading } from "@/components/heading"
import { Text } from "@/components/text"
import Link from "next/link"

export default function Home() {
   return (
      <section>
         <Heading>Hi, I&apos;m Nazar 🪖</Heading>

         <section className="prose prose-neutral mt-8 max-w-full dark:prose-invert">
            <Text>
               I&apos;m a developer with a passion for building beautiful and
               functional applications. I currently{" "}
               <Link href={"/work"}>
                  <span className="text-neutral-400">/</span>work
               </Link>{" "}
               as a backend developer at{" "}
               <a href="https://assisterr.ai">Assisterr</a> - an SLM startup building more artificial intelligence models for clients on Earth.
            </Text>
         </section>

         <Cards />
      </section>
   )
}

export const revalidate = 3600
