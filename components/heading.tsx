"use client"

import { defaultVariants } from "@/components/motion.variants"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import { motion } from "framer-motion"

const MotionSlot = motion.create(Slot)

type HeadingProps = {
  children: React.ReactNode
  className?: string
  asChild?: boolean
  hasMotion?: boolean
}

export function Heading({
  children,
  className,
  asChild,
  hasMotion = true,
  ...props
}: HeadingProps) {
  if (asChild) {
    if (hasMotion) {
      return (
        <MotionSlot
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={defaultVariants}
          className={cn(
            "text-2xl font-medium leading-relaxed dark:text-white",
            className,
          )}
          {...(props as any)}
        >
          {children}
        </MotionSlot>
      )
    }

    return (
      <Slot
        className={cn(
          "text-2xl font-medium leading-relaxed dark:text-white",
          className,
        )}
      >
        {children}
      </Slot>
    )
  }

  if (!hasMotion) {
    return (
      <h1
        className={cn(
          "text-2xl font-medium leading-relaxed dark:text-white",
          className,
        )}
        {...(props as any)}
      >
        {children}
      </h1>
    )
  }

  return (
    <motion.h1
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={defaultVariants}
      className={cn(
        "text-2xl font-medium leading-relaxed dark:text-white",
        className,
      )}
      {...(props as any)}
    >
      {children}
    </motion.h1>
  )
}
