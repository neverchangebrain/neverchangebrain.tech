'use client';

import { defaultVariantsNoDelay } from '@/constants/motion-variants';
import { networking } from '@/constants/profile';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type WakaStats = {
  data: {
    total_seconds_including_other_language: number;
  };
};

function GlitchDigits({ length = 6, intervalMs = 90 }: { length?: number; intervalMs?: number }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const tick = () => {
      let next = '';
      for (let i = 0; i < length; i++) next += Math.floor(Math.random() * 10).toString();
      setValue(next);
    };

    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, length]);

  return (
    <span
      className="font-mono tabular-nums"
      style={{ width: `${length}ch`, display: 'inline-block', textAlign: 'center' }}
    >
      {value}
    </span>
  );
}

const MotionLink = motion.create('a');

export function TimeCard() {
  const [codingTime, setCodingTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<WakaStats>('/api/wakatime')
      .then((res) => {
        const seconds = res.data.data.total_seconds_including_other_language;
        const hours = Math.floor(seconds / 3600);

        setCodingTime(hours > 0 ? `${hours} hrs` : null);
      })
      .catch(() => setCodingTime(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MotionLink
      href={`https://wakatime.com/@${networking.wakatime}`}
      target="_blank"
      title="WakaTime profile"
      variants={defaultVariantsNoDelay}
      whileHover={{ scale: 1.05 }}
      className="card-border relative col-span-4 col-start-5 row-start-1 flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-white p-4 md:col-span-2 md:col-start-6 md:row-span-0 dark:bg-neutral-900"
    >
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="flex flex-row items-center justify-center gap-2">
          <AnimatePresence mode="wait" initial={false}>
            {loading ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(6px)' }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <GlitchDigits />
              </motion.span>
            ) : (
              <motion.span
                key="loaded"
                className="font-mono tabular-nums"
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(6px)' }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {codingTime ?? 'No data'}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionLink>
  );
}
