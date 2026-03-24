'use client';

import { cn } from '@/lib/utils';
import { HTMLMotionProps, motion } from 'framer-motion';

type WorkShellProps = {
  children: React.ReactNode;
} & HTMLMotionProps<'div'>;

export function WorkShell({ children, className, ...props }: WorkShellProps) {
  return (
    <motion.div
      className={cn('prose prose-neutral dark:prose-invert mt-8 max-w-full text-pretty', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
