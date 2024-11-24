"use client"

import { defaultVariantsNoDelay } from "@/components/motion.variants"
import { motion } from "framer-motion"
import { GitlabIcon } from "lucide-react"
import Link from "next/link"

export function GitlabCard() {
   const MotionLink = motion.create(Link)
   return (
      <MotionLink
         href={"https://linkedin.com/in/olivercederborg"}
         target="_blank"
         title="Linkedin profile"
         variants={defaultVariantsNoDelay}
         whileHover={{ scale: 1.05 }}
         className="card-border relative col-span-2 row-span-1 flex items-center justify-center gap-x-2 overflow-hidden rounded-xl bg-[#ffa25b] text-white dark:bg-[#ff770f] md:col-span-1 md:col-start-3 md:row-span-1 md:row-start-3"
      >
         <GitlabIcon size={30} />
      </MotionLink>
   )
}
