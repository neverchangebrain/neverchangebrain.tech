'use client';

import { ToastContainer } from './toast';
import { ToastBridge, ToastProvider, useToast } from './use-toast';

function InnerToaster() {
  const { toasts, dismiss } = useToast();
  return (
    <>
      <ToastBridge />
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </>
  );
}

export function Toaster() {
  return (
    <ToastProvider>
      <InnerToaster />
    </ToastProvider>
  );
}
