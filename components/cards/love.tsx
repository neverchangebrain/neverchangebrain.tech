"use client"

import { defaultVariantsNoDelay } from "@/components/motion.variants"
import { motion } from "framer-motion"
import Link from "next/link"
import { TelegramFullIcon } from "@/components/icons/telegram-full"

export function LoveManagerCard() {
  const MotionLink = motion.create(Link)
  return (
    <MotionLink
      href={"https://t.me/ukitiooo"}
      target="_blank"
      title="Love & Manager profile"
      variants={defaultVariantsNoDelay}
      whileHover={{ scale: 1.05 }}
      className="card-border relative col-span-2 row-span-1 flex items-center justify-between gap-x-0.5 overflow-hidden rounded-xl bg-[#FF8EDD] px-4 text-white md:col-span-2 md:col-start-4 md:row-span-1"
    >
      <TelegramFullIcon className="hidden md:block" />
      <span className="mx-auto w-full text-center font-semibold">Sasha</span>
    </MotionLink>
  )
}
