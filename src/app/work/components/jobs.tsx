'use client';

import { Button } from '@/components/ui/button';
import { defaultVariantsNoDelay } from '@/constants/motion-variants';
import type { WorkJob } from '@/features/experience/model';
import { cn } from '@/lib/utils';
import { differenceInDays } from 'date-fns';
import { AnimatePresence, MotionProps, motion } from 'framer-motion';
import React from 'react';

export function Jobs({ jobs }: { jobs: WorkJob[] }) {
  const [openId, setOpenId] = React.useState<number | null>(null);

  const openJob = openId == null ? null : (jobs.find((j) => j.id === openId) ?? null);

  React.useEffect(() => {
    if (openId == null) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenId(null);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openId]);

  if (jobs.length === 0) {
    return (
      <div className="mt-12 flex w-full items-center justify-center">
        <div className="card-border w-full max-w-2xl rounded-xl bg-white p-6 text-sm text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
          No work experience entries yet.
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              delayChildren: 0.25,
              staggerChildren: 0.1,
            },
          },
        }}
        className="mt-12 flex w-full flex-col items-center"
      >
        {jobs.map((job, index) => (
          <React.Fragment key={`${job.companyName}-${job.id}`}>
            {index !== 0 && (
              <motion.div
                variants={{
                  hidden: { opacity: 0, scaleY: 0 },
                  visible: {
                    opacity: 1,
                    scaleY: 1,
                    transition: {
                      delay: 0.65,
                      duration: 0.5,
                    },
                  },
                }}
                className="z-[-1] mt-2.25 h-6 w-px origin-top bg-neutral-200 dark:bg-neutral-500/20"
              />
            )}
            <JobCard job={job} onOpen={() => setOpenId(job.id)} />
          </React.Fragment>
        ))}
      </motion.div>

      <AnimatePresence>
        {openJob && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <div
              className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm"
              onClick={() => setOpenId(null)}
            />

            <div
              className="absolute inset-0 flex items-center justify-center p-4"
              onClick={() => setOpenId(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="card-border relative isolate w-full max-w-2xl overflow-hidden rounded-xl bg-white p-6 text-sm dark:bg-neutral-900"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate text-lg font-normal text-neutral-900 dark:text-white">
                      {openJob.companyName}
                    </div>
                    <div className="mt-1 text-neutral-600 dark:text-neutral-300">
                      {openJob.position}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Close"
                    onClick={() => setOpenId(null)}
                  >
                    <span className="text-2xl leading-none">×</span>
                  </Button>
                </div>

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-neutral-600 dark:text-neutral-300">
                  <div>
                    <span className="text-neutral-500 dark:text-neutral-400">Duration:</span>{' '}
                    {getDurationDays(openJob)}
                  </div>
                  <div>
                    <span className="text-neutral-500 dark:text-neutral-400">Type:</span>{' '}
                    {getWorkTypeLabel(openJob.workType)}
                  </div>
                </div>

                {openJob.targetTask && (
                  <div className="mt-6">
                    <div className="text-xs tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                      Target task
                    </div>
                    <p className="mt-2 mb-0 text-neutral-700 dark:text-neutral-200">
                      {openJob.targetTask}
                    </p>
                  </div>
                )}

                {getStackTags(openJob.stack).length > 0 && (
                  <div className="mt-6">
                    <div className="text-xs tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                      Stack
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {getStackTags(openJob.stack).map((item) => (
                        <span
                          key={item}
                          className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

type JobCardProps = {
  job: WorkJob;
  onOpen: () => void;
} & MotionProps;

export function JobCard({ job, onOpen, ...props }: JobCardProps) {
  const dateRangeShort = job.from ? `${job.from} — ${job.to}` : job.to;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <motion.div
      variants={defaultVariantsNoDelay}
      {...props}
      className={cn(
        'card-border relative flex w-full max-w-2xl cursor-pointer flex-col rounded-xl bg-white p-6 py-8 transition-colors duration-200 ease-in-out dark:bg-neutral-900',
        {
          'ring-1 ring-neutral-200 ring-offset-8 ring-offset-neutral-100 dark:ring-neutral-500/20 dark:ring-offset-neutral-950':
            job.current,
        },
      )}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={onKeyDown}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="m-0 mb-1 truncate text-xl font-normal dark:text-white">
            {job.companyUrl ? (
              <a
                href={job.companyUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {job.companyName}
              </a>
            ) : (
              <span>{job.companyName}</span>
            )}
          </h2>

          <p className="m-0 text-sm text-neutral-500 dark:text-neutral-400">{job.position}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end text-sm text-neutral-500 dark:text-neutral-400">
          <span>{dateRangeShort}</span>
        </div>
      </div>

      {job.description && (
        <p className="mt-4 mb-0 max-w-prose text-sm text-neutral-700 dark:text-neutral-300">
          {job.description}
        </p>
      )}
    </motion.div>
  );
}

function getDurationDays(job: WorkJob) {
  if (!job.joinedAt) return '—';

  const joinedDate = new Date(job.joinedAt);
  const leftDate = job.leftAt ? new Date(job.leftAt) : null;
  const endDate = leftDate ?? new Date();
  const days = Math.max(0, differenceInDays(endDate, joinedDate));
  return `${days} days`;
}

function getStackTags(value: string | null) {
  if (!value) return [] as string[];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function getWorkTypeLabel(workType: string) {
  switch (workType) {
    case 'project':
      return 'Project';
    case 'contract':
      return 'Contract';
    case 'company':
    default:
      return 'Company';
  }
}
