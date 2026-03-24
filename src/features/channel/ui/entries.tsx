'use client';

import { defaultVariantsNoDelay } from '@/constants/motion-variants';
import { networking } from '@/constants/profile';
import { cn } from '@/lib/utils';
import { differenceInDays } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';

import { ChannelCommentForm } from './comment-form';

import type { ChannelThread } from '../model/types';

type EntriesProps = {
  entries: ChannelThread[];
  canComment: boolean;
};

export function ChannelEntries({ entries, canComment }: EntriesProps) {
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
          <ChannelEntry key={entry.id} entry={entry} canComment={canComment} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

type EntryProps = {
  entry: ChannelThread;
  className?: string;
  canComment: boolean;
};

export function ChannelEntry({ entry, className, canComment }: EntryProps) {
  const { email, body, createdBy, createdAt, isPinned, commentsClosed, comments } = entry;
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
          {isPinned && (
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-neutral-500 dark:border-black/10 dark:text-neutral-600">
              pinned
            </span>
          )}
          {commentsClosed && (
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-neutral-500 dark:border-black/10 dark:text-neutral-600">
              comments closed
            </span>
          )}
        </div>
        <span className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
          {timeSinceEntry}
        </span>
      </div>
      <p className="text-pretty wrap-break-word">{body}</p>

      {(comments.length > 0 || canComment) && (
        <div className="mt-2 border-t border-white/5 pt-3">
          {comments.length > 0 && (
            <div className="space-y-2">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl bg-neutral-200/10 px-3 py-2 text-xs leading-5 dark:bg-neutral-900/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-neutral-500 dark:text-neutral-400">{c.createdBy}</span>
                    <span className="text-neutral-500 dark:text-neutral-400">
                      {differenceInDays(new Date(), c.createdAt) > 0
                        ? `${differenceInDays(new Date(), c.createdAt)}d ago`
                        : 'today'}
                    </span>
                  </div>
                  <p className="wrap-break-word">{c.body}</p>
                </div>
              ))}
            </div>
          )}

          {canComment && <ChannelCommentForm messageId={entry.id} disabled={commentsClosed} />}
        </div>
      )}
    </motion.div>
  );
}
