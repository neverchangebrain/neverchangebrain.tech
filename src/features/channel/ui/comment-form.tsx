'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import * as React from 'react';

import { saveChannelComment } from '../service/actions';

type FormState = {
  success: boolean;
  message: string;
};

const initialState: FormState = {
  success: false,
  message: '',
};

export function ChannelCommentForm({
  messageId,
  parentCommentId,
  placeholder,
  autoFocus,
}: {
  messageId: number;
  parentCommentId?: number | null;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const ref = React.useRef<HTMLFormElement>(null);
  const [state, action] = React.useActionState<FormState, FormData>(formAction, initialState);

  async function formAction(_prev: FormState, formData: FormData): Promise<FormState> {
    const res = await saveChannelComment(messageId, parentCommentId ?? null, formData);
    if (res.success) ref.current?.reset();
    return res;
  }

  return (
    <div className="mt-2 flex w-full flex-col gap-2">
      <form ref={ref} action={action} className="flex w-full flex-1 gap-2">
        <Input
          id={`entry-${messageId}`}
          name="entry"
          type="text"
          placeholder={placeholder ?? 'write a comment'}
          minLength={2}
          maxLength={500}
          required
          autoFocus={autoFocus}
          className={cn({
            'border-red-300': !state.success && state.message,
          })}
        />
        <Button type="submit">reply</Button>
      </form>

      {state.message && (
        <p
          className={cn('text-xs', {
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
