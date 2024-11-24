"use client"

import { Telegram } from "@/components/icons/telegram"
import { defaultVariantsNoDelay } from "@/components/motion.variants"
import { motion } from "framer-motion"
import Link from "next/link"

export function TelegramCard() {
   const MotionLink = motion.create(Link)
   return (
      <MotionLink
         href={"https://t.me/neverchangebrain"}
         target="_blank"
         title="Telegram profile"
         variants={defaultVariantsNoDelay}
         whileHover={{ scale: 1.05 }}
         className="card-border relative col-span-2 row-span-1 flex items-center justify-center gap-x-2 overflow-hidden rounded-xl bg-[#70ccf9] text-white dark:bg-[#38a8e1] md:col-span-2 md:col-start-4 md:row-span-1"
      >
         <Telegram className="hidden md:block" />
      </MotionLink>
   )
}
