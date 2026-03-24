'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import Image from 'next/image';

import { editChannelComment, editChannelMessage } from '../service/actions';

import type { ChannelCommentNode, ChannelThread } from '../model/types';

import { useChannelRealtime } from './realtime';

type AdminActions = {
  adminClearChannelReactions: (formData: FormData) => Promise<void>;
  adminDeleteChannelComment: (formData: FormData) => Promise<void>;
  adminDeleteChannelMessage: (formData: FormData) => Promise<void>;
  adminToggleChannelMessageCommentsClosed: (formData: FormData) => Promise<void>;
  adminToggleChannelMessagePinned: (formData: FormData) => Promise<void>;
};

function ReactionIcon({ emoji }: { emoji: string }) {
  if (emoji === 'emoji') {
    return (
      <Image
        src="/assets/emoji.gif"
        alt="reaction"
        width={14}
        height={14}
        className="h-3.5 w-3.5"
        unoptimized
        draggable={false}
      />
    );
  }

  return <span className="text-[11px]">{emoji}</span>;
}

function hasAnyReactions(reactions: ChannelThread['reactions']): boolean {
  return reactions.some((r) => (r.count ?? 0) > 0);
}

export function ChannelAdminPanel({
  initialThreads,
  actions,
}: {
  initialThreads: ChannelThread[];
  actions: AdminActions;
}) {
  const [threads, setThreads] = React.useState(initialThreads);
  const [visiblePostCount, setVisiblePostCount] = React.useState(20);
  const [visibleRootCommentsByPostId, setVisibleRootCommentsByPostId] = React.useState<
    Record<number, number>
  >({});

  useChannelRealtime(setThreads, null);

  React.useEffect(() => {
    setThreads(initialThreads);
  }, [initialThreads]);

  const visibleThreads = threads.slice(0, visiblePostCount);

  return (
    <div className="mt-8 space-y-6">
      {visibleThreads.map((t) => (
        <div
          key={t.id}
          className="rounded-2xl border border-neutral-950/10 bg-neutral-950/5 px-4 py-4 text-sm dark:border-white/5 dark:bg-neutral-200/5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                #{t.id} • {t.createdBy}
                {t.email ? ` • ${t.email}` : ''}
              </div>
              <div className="mt-2 wrap-break-word">{t.body}</div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {t.reactions.map((r) => (
                  <div
                    key={r.emoji}
                    className="flex items-center gap-1 rounded-full border border-neutral-950/10 bg-neutral-950/5 px-2 py-1 text-[11px] text-neutral-500 dark:border-white/10 dark:bg-neutral-900/10 dark:text-neutral-400"
                  >
                    <ReactionIcon emoji={r.emoji} />
                    <span>{r.count ?? 0}</span>
                  </div>
                ))}

                <form action={actions.adminClearChannelReactions}>
                  <input type="hidden" name="messageId" value={t.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={!hasAnyReactions(t.reactions)}
                  >
                    clear reactions
                  </Button>
                </form>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <AdminInlineEdit
                initialBody={t.body ?? ''}
                onSave={async (nextBody) => editChannelMessage(t.id, nextBody)}
              />

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
            <div className="mt-4 space-y-2 border-t border-neutral-950/10 pt-4 dark:border-white/5">
              {t.comments.slice(0, visibleRootCommentsByPostId[t.id] ?? 10).map((c) => (
                <AdminCommentNode
                  key={c.id}
                  node={c}
                  depth={0}
                  deleteAction={actions.adminDeleteChannelComment}
                  clearReactionsAction={actions.adminClearChannelReactions}
                />
              ))}

              {t.comments.length > (visibleRootCommentsByPostId[t.id] ?? 10) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setVisibleRootCommentsByPostId((prev) => ({
                      ...prev,
                      [t.id]: (prev[t.id] ?? 10) + 10,
                    }))
                  }
                >
                  load more comments
                </Button>
              )}
            </div>
          )}
        </div>
      ))}

      {threads.length > visiblePostCount && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setVisiblePostCount((v) => v + 20)}
          >
            load more posts
          </Button>
        </div>
      )}
    </div>
  );
}

function AdminInlineEdit({
  initialBody,
  onSave,
}: {
  initialBody: string;
  onSave: (nextBody: string) => Promise<{ success: boolean; message: string }>;
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(initialBody);
  const [isPending, startTransition] = React.useTransition();

  if (!isEditing) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-[11px] text-neutral-500 dark:text-neutral-400"
        onClick={() => {
          setDraft(initialBody);
          setIsEditing(true);
        }}
      >
        edit
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
          className="h-8"
        />
        <Button
          type="button"
          size="sm"
          className="h-8"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const res = await onSave(draft);
              toast({
                title: res.success ? 'Saved' : 'Failed',
                description: res.message,
                variant: res.success ? 'default' : 'destructive',
              });
              if (res.success) setIsEditing(false);
            });
          }}
        >
          save
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-[11px] text-neutral-500 dark:text-neutral-400"
          onClick={() => setIsEditing(false)}
        >
          cancel
        </Button>
      </div>
    </div>
  );
}

function AdminCommentNode({
  node,
  depth,
  deleteAction,
  clearReactionsAction,
}: {
  node: ChannelCommentNode;
  depth: number;
  deleteAction: (formData: FormData) => Promise<void>;
  clearReactionsAction: (formData: FormData) => Promise<void>;
}) {
  const clampedDepth = Math.min(depth, 6);

  return (
    <div style={{ marginLeft: clampedDepth * 12 }} className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-neutral-950/5 px-3 py-2 text-xs dark:bg-neutral-900/10">
        <div className="min-w-0 wrap-break-word">
          <div className="text-neutral-500 dark:text-neutral-400">
            #{node.id} • {node.createdBy}
            {node.email ? ` • ${node.email}` : ''}
          </div>
          <div className="mt-1">{node.body}</div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {node.reactions.map((r) => (
              <div
                key={r.emoji}
                className="flex items-center gap-1 rounded-full border border-neutral-950/10 bg-neutral-950/5 px-2 py-1 text-[11px] text-neutral-500 dark:border-white/10 dark:bg-neutral-900/10 dark:text-neutral-400"
              >
                <ReactionIcon emoji={r.emoji} />
                <span>{r.count ?? 0}</span>
              </div>
            ))}

            <form action={clearReactionsAction}>
              <input type="hidden" name="messageId" value={node.messageId} />
              <input type="hidden" name="commentId" value={node.id} />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={!hasAnyReactions(node.reactions)}
              >
                clear reactions
              </Button>
            </form>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <AdminInlineEdit
            initialBody={node.body ?? ''}
            onSave={async (nextBody) => editChannelComment(node.id, nextBody)}
          />

          <form action={deleteAction}>
            <input type="hidden" name="id" value={node.id} />
            <Button type="submit" variant="destructive" size="sm">
              delete
            </Button>
          </form>
        </div>
      </div>

      {node.replies?.length > 0 && (
        <div className="space-y-2">
          {node.replies.map((r) => (
            <AdminCommentNode
              key={r.id}
              node={r}
              depth={depth + 1}
              deleteAction={deleteAction}
              clearReactionsAction={clearReactionsAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
