'use client';

import { type SelectChannelMessage } from '@/app/db/schema';
import { defaultVariantsNoDelay } from '@/components/motion.variants';
import { networking } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { differenceInDays } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';

type EntriesProps = {
  entries: SelectChannelMessage[];
};

export function Entries({ entries }: EntriesProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              delayChildren: 0.3,
              staggerChildren: 0.15,
            },
          },
        }}
        className="mt-16 flex flex-col space-y-3 border-t border-white/5 py-8"
      >
        {entries.map((entry) => (
          <Entry key={entry.id} entry={entry} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

type EntryProps = {
  entry: SelectChannelMessage;
  className?: string;
};

export function Entry({ entry, className }: EntryProps) {
  const { email, body, createdBy, createdAt } = entry;
  const isOwner = email === networking.email;

  const daysSinceEntry = differenceInDays(new Date(), createdAt);
  const timeSinceEntry =
    daysSinceEntry > 1
      ? `${daysSinceEntry} days ago`
      : daysSinceEntry === 1
        ? 'yesterday'
        : 'today';

  return (
    <motion.div
      variants={defaultVariantsNoDelay}
      className={cn(
        'flex w-full flex-col gap-2 rounded-2xl border bg-neutral-200/10 px-4 py-3 text-sm leading-6 dark:border-white/5 dark:bg-neutral-900/10',
        isOwner && 'bg-neutral-900/10 dark:bg-neutral-200/10',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{createdBy}</span>
          {isOwner && (
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-neutral-500 dark:border-black/10 dark:text-neutral-600">
              owner
            </span>
          )}
        </div>
        <span className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
          {timeSinceEntry}
        </span>
      </div>
      <p className="text-pretty break-words">{body}</p>
    </motion.div>
  );
}
