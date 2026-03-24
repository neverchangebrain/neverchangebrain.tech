'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';

import { cn } from '@/lib/utils';

import type { ToastItem } from './use-toast';

const ToastRoot = ToastPrimitive.Root;

export function ToastViewport() {
  return (
    <ToastPrimitive.Viewport
      className={cn(
        'fixed top-4 right-4 left-4 z-50 flex w-auto flex-col gap-2 outline-none sm:top-6 sm:right-6 sm:left-auto sm:w-[320px]',
      )}
    />
  );
}

export function Toast({
  toast,
  onOpenChange,
}: {
  toast: ToastItem;
  onOpenChange: (open: boolean) => void;
}) {
  const variant = toast.variant ?? 'default';

  return (
    <ToastRoot
      open
      onOpenChange={onOpenChange}
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:slide-out-to-right-2 data-[state=open]:slide-in-from-right-2',
        'bg-background pointer-events-auto rounded-2xl border px-4 py-3 text-sm shadow-sm',
        variant === 'destructive' && 'border-destructive/30',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {toast.title ? (
            <ToastPrimitive.Title className="text-sm font-medium">
              {toast.title}
            </ToastPrimitive.Title>
          ) : null}

          {toast.description ? (
            <ToastPrimitive.Description className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {toast.description}
            </ToastPrimitive.Description>
          ) : null}
        </div>

        <ToastPrimitive.Close
          className={cn(
            'hover:bg-accent hover:text-accent-foreground shrink-0 rounded-lg px-2 py-1 text-xs text-neutral-500',
          )}
          aria-label="Close"
        >
          ×
        </ToastPrimitive.Close>
      </div>
    </ToastRoot>
  );
}

export function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: ToastItem[];
  dismiss: (id: string) => void;
}) {
  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={3500}>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          toast={t}
          onOpenChange={(open) => {
            if (!open) dismiss(t.id);
          }}
        />
      ))}
      <ToastViewport />
    </ToastPrimitive.Provider>
  );
}
