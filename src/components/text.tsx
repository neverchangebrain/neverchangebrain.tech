'use client';

import { defaultVariants } from '@/constants/motion-variants';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { MotionProps, motion } from 'framer-motion';

const MotionSlot = motion.create(Slot);

type BaseTextProps = {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
};

type MotionTextProps = BaseTextProps &
  MotionProps & {
    hasMotion?: true;
  };

type StaticTextProps = BaseTextProps &
  React.ComponentPropsWithoutRef<'p'> & {
    hasMotion: false;
  };

type TextProps = MotionTextProps | StaticTextProps;

export function Text({ children, className, asChild, hasMotion = true, ...props }: TextProps) {
  if (asChild) {
    if (hasMotion) {
      return (
        <MotionSlot
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={defaultVariants}
          className={cn('text-base leading-relaxed font-normal', className)}
          {...(props as MotionProps)}
        >
          {children}
        </MotionSlot>
      );
    }

    return (
      <Slot className={cn('text-base leading-relaxed font-normal', className)}>{children}</Slot>
    );
  }

  if (hasMotion) {
    return (
      <motion.p
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={defaultVariants}
        className={cn('text-base leading-relaxed font-normal', className)}
        {...(props as MotionProps)}
      >
        {children}
      </motion.p>
    );
  }

  const staticProps = props as React.ComponentPropsWithoutRef<'p'>;
  return (
    <p className={cn('text-base leading-relaxed font-normal', className)} {...staticProps}>
      {children}
    </p>
  );
}
