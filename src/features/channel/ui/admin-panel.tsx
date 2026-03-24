'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';

import type { ChannelCommentNode, ChannelThread } from '../model/types';

import { useChannelRealtime } from './realtime';

type AdminActions = {
  adminDeleteChannelComment: (formData: FormData) => Promise<void>;
  adminDeleteChannelMessage: (formData: FormData) => Promise<void>;
  adminToggleChannelMessageCommentsClosed: (formData: FormData) => Promise<void>;
  adminToggleChannelMessagePinned: (formData: FormData) => Promise<void>;
};

export function ChannelAdminPanel({
  initialThreads,
  actions,
}: {
  initialThreads: ChannelThread[];
  actions: AdminActions;
}) {
  const [threads, setThreads] = React.useState(initialThreads);

  useChannelRealtime(setThreads);

  React.useEffect(() => {
    setThreads(initialThreads);
  }, [initialThreads]);

  return (
    <div className="mt-8 space-y-6">
      {threads.map((t) => (
        <div
          key={t.id}
          className="rounded-2xl border border-white/5 bg-neutral-900/10 px-4 py-4 text-sm dark:bg-neutral-200/5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                #{t.id} • {t.createdBy}
              </div>
              <div className="mt-2 wrap-break-word">{t.body}</div>
            </div>

            <div className="flex flex-wrap gap-2">
              <form action={actions.adminToggleChannelMessagePinned}>
                <input type="hidden" name="id" value={t.id} />
                <Button type="submit" variant="outline" size="sm">
                  {t.isPinned ? 'unpin' : 'pin'}
                </Button>
              </form>

              <form action={actions.adminToggleChannelMessageCommentsClosed}>
                <input type="hidden" name="id" value={t.id} />
                <Button type="submit" variant="outline" size="sm">
                  {t.commentsClosed ? 'open comments' : 'close comments'}
                </Button>
              </form>

              <form action={actions.adminDeleteChannelMessage}>
                <input type="hidden" name="id" value={t.id} />
                <Button type="submit" variant="destructive" size="sm">
                  delete post
                </Button>
              </form>
            </div>
          </div>

          {t.comments.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
              {t.comments.map((c) => (
                <AdminCommentNode
                  key={c.id}
                  node={c}
                  depth={0}
                  deleteAction={actions.adminDeleteChannelComment}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AdminCommentNode({
  node,
  depth,
  deleteAction,
}: {
  node: ChannelCommentNode;
  depth: number;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const clampedDepth = Math.min(depth, 6);

  return (
    <div style={{ marginLeft: clampedDepth * 12 }} className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-neutral-200/10 px-3 py-2 text-xs dark:bg-neutral-900/10">
        <div className="min-w-0 wrap-break-word">
          <div className="text-neutral-500 dark:text-neutral-400">
            #{node.id} • {node.createdBy}
          </div>
          <div className="mt-1">{node.body}</div>
        </div>
        <form action={deleteAction}>
          <input type="hidden" name="id" value={node.id} />
          <Button type="submit" variant="destructive" size="sm">
            delete
          </Button>
        </form>
      </div>

      {node.replies?.length > 0 && (
        <div className="space-y-2">
          {node.replies.map((r) => (
            <AdminCommentNode key={r.id} node={r} depth={depth + 1} deleteAction={deleteAction} />
          ))}
        </div>
      )}
    </div>
  );
}
