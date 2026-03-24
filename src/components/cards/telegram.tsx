'use client';

import { TelegramIcon } from '@/components/icons/telegram';
import { defaultVariantsNoDelay } from '@/constants/motion-variants';
import { networking } from '@/constants/profile';
import { motion } from 'framer-motion';
import Link from 'next/link';

const MotionLink = motion.create(Link);

export function TelegramCard() {
  return (
    <MotionLink
      href={`https://t.me/${networking.telegram}`}
      target="_blank"
      title="Telegram profile"
      variants={defaultVariantsNoDelay}
      whileHover={{ scale: 1.05 }}
      className="card-border relative col-span-2 row-span-1 flex items-center justify-center gap-x-2 overflow-hidden rounded-xl bg-emerald-100 text-emerald-900 md:col-span-1 md:col-start-3 md:row-span-1 md:row-start-3 dark:bg-emerald-950 dark:text-emerald-50"
    >
      <TelegramIcon className="hidden md:block" />
    </MotionLink>
  );
}
