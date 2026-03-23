'use client';

import { defaultVariantsNoDelay } from '@/components/motion.variants';
import { networking } from '@/lib/constants';
import { motion } from 'framer-motion';
import Link from 'next/link';

const MotionLink = motion.create(Link);

export function EmailCard() {
  return (
    <MotionLink
      href={`mailto:${networking.email}`}
      title="Email"
      variants={defaultVariantsNoDelay}
      whileHover={{ scale: 1.05 }}
      className="card-border relative col-span-2 row-span-1 flex items-center justify-between gap-x-0.5 overflow-hidden rounded-xl bg-amber-100 px-4 text-amber-950 dark:bg-amber-950 dark:text-amber-50 md:col-span-2 md:col-start-4 md:row-span-1"
    >
      <span className="mx-auto w-full text-center">Message</span>
    </MotionLink>
  );
}
