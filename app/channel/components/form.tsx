'use client';

import { saveChannelMessage } from '@/app/db/actions';
import { defaultVariants } from '@/components/motion.variants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import * as React from 'react';

type FormState = {
  success: boolean;
  message: string;
};

const initialState: FormState = {
  success: false,
  message: '',
};

export default function Form() {
  const ref = React.useRef<HTMLFormElement>(null);
  const [state, action] = React.useActionState<FormState, FormData>(formAction, initialState);

  async function formAction(_prevState: FormState, formData: FormData): Promise<FormState> {
    const res = await saveChannelMessage(formData);
    if (res.success) ref.current?.reset();
    return res;
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <form ref={ref} action={action} className="flex w-full flex-1 gap-2">
        <Input
          id="entry"
          name="entry"
          type="text"
          placeholder="write something"
          minLength={5}
          maxLength={500}
          required
          className={cn({
            'border-red-300': !state.success && state.message,
          })}
        />
        <Button type="submit">post</Button>
      </form>

      {state.message && (
        <p
          className={cn('text-sm', {
            'text-green-400 dark:text-green-300': state.success,
            'text-red-400 dark:text-red-300': !state.success,
          })}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}

export function FormShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={defaultVariants}
      className="mt-12 space-y-2"
    >
      {children}
    </motion.div>
  );
}
