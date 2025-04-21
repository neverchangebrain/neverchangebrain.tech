"use client"

import { defaultVariantsNoDelay } from "@/components/motion.variants"
import { motion } from "framer-motion"
import Link from "next/link"
import { TelegramIcon } from "@/components/icons/telegram"

export function TelegramCard() {
  const MotionLink = motion.create(Link)
  return (
    <MotionLink
      href={"https://t.me/neverchangebrain"}
      target="_blank"
      title="Telegram profile"
      variants={defaultVariantsNoDelay}
      whileHover={{ scale: 1.05 }}
      className="card-border relative col-span-2 row-span-1 flex items-center justify-center gap-x-2 overflow-hidden rounded-xl bg-[#0077B5] text-white dark:bg-[#0077B5] md:col-span-1 md:col-start-3 md:row-span-1 md:row-start-3"
    >
      <TelegramIcon className="hidden md:block" />
    </MotionLink>
  )
}
