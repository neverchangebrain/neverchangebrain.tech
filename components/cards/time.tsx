"use client"

import { defaultVariantsNoDelay } from "@/components/motion.variants"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import axios from "axios"

type WakaStats = {
  data: {
    total_seconds_including_other_language: number
  }
}

const MotionLink = motion.create("a")

export function TimeCard() {
  const [codingTime, setCodingTime] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get<WakaStats>("/api/wakatime")
      .then((res) => {
        const seconds = res.data.data.total_seconds_including_other_language
        const hours = Math.floor(seconds / 3600)
        setCodingTime(hours > 0 ? `${hours} hrs` : null)
      })
      .catch(() => setCodingTime(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <MotionLink
      href="https://wakatime.com/@neverchangebrain"
      target="_blank"
      title="WakaTime profile"
      variants={defaultVariantsNoDelay}
      whileHover={{ scale: 1.05 }}
      className="md:row-span-0 card-border relative col-span-4 col-start-5 row-start-1 flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-white p-4 dark:bg-neutral-900 md:col-span-2 md:col-start-6"
    >
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="flex flex-row items-center justify-center gap-2">
          {loading ? "Loading..." : (codingTime ?? "No data")}
        </div>
      </div>
    </MotionLink>
  )
}
