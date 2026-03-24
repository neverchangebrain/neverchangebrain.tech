'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { defaultVariantsNoDelay } from '@/constants/motion-variants';
import { networking } from '@/constants/profile';
import { cn } from '@/lib/utils';
import { differenceInDays } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import * as React from 'react';

import { ChannelCommentForm } from './comment-form';
import { useChannelRealtime } from './realtime';

import { editChannelComment, editChannelMessage, toggleChannelReaction } from '../service/actions';

import type { ChannelCommentNode, ChannelThread } from '../model/types';

function ReactionIcon({ emoji }: { emoji: string }) {
  if (emoji === 'emoji') {
    return (
      <Image
        src="/assets/emoji.gif"
        alt="reaction"
        width={16}
        height={16}
        className="h-4 w-4"
        unoptimized
        draggable={false}
      />
    );
  }

  return <span>{emoji}</span>;
}

function toggleReactionInThreads(
  threads: ChannelThread[],
  messageId: number,
  commentId: number | null,
  emoji: string,
): ChannelThread[] {
  const toggleInReactions = (reactions: ChannelThread['reactions']) =>
    reactions.map((r) => {
      if (r.emoji !== (emoji as any)) return r;
      const nextReacted = !r.reacted;
      const nextCount = Math.max(0, r.count + (nextReacted ? 1 : -1));
      return { ...r, reacted: nextReacted, count: nextCount };
    });

  const toggleInNodes = (nodes: ChannelCommentNode[]): ChannelCommentNode[] =>
    nodes.map((n) => {
      if (commentId && n.id === commentId) {
        return { ...n, reactions: toggleInReactions(n.reactions) };
      }
      if (n.replies?.length) return { ...n, replies: toggleInNodes(n.replies) };
      return n;
    });

  return threads.map((t) => {
    if (t.id !== messageId) return t;
    if (!commentId) return { ...t, reactions: toggleInReactions(t.reactions) };
    return { ...t, comments: toggleInNodes(t.comments) };
  });
}

type EntriesProps = {
  entries: ChannelThread[];
  canComment: boolean;
  viewerEmail?: string | null;
};

export function ChannelEntries({ entries, canComment, viewerEmail }: EntriesProps) {
  const [threads, setThreads] = React.useState(entries);
  const [visibleCount, setVisibleCount] = React.useState(20);

  useChannelRealtime(setThreads, viewerEmail);

  React.useEffect(() => {
    setThreads(entries);
  }, [entries]);

  const visibleThreads = threads.slice(0, visibleCount);

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
        {visibleThreads.map((entry) => (
          <ChannelEntry
            key={entry.id}
            entry={entry}
            canComment={canComment}
            viewerEmail={viewerEmail}
            setThreads={setThreads}
          />
        ))}

        {threads.length > visibleCount && (
          <button
            type="button"
            className="mt-2 self-center rounded-xl border border-white/10 bg-neutral-200/10 px-4 py-2 text-xs text-neutral-500 dark:bg-neutral-900/10 dark:text-neutral-400"
            onClick={() => setVisibleCount((v) => v + 20)}
          >
            load more
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

type EntryProps = {
  entry: ChannelThread;
  className?: string;
  canComment: boolean;
  viewerEmail?: string | null;
  setThreads: React.Dispatch<React.SetStateAction<ChannelThread[]>>;
};

export function ChannelEntry({
  entry,
  className,
  canComment,
  viewerEmail,
  setThreads,
}: EntryProps) {
  const { email, body, createdBy, createdAt, isPinned, commentsClosed, comments } = entry;
  const isOwnerPost = email === networking.email;
  const viewerIsOwner = Boolean(viewerEmail) && viewerEmail === networking.email;
  const canEditPost = Boolean(viewerEmail) && (viewerIsOwner || email === viewerEmail);

  const [isEditingPost, setIsEditingPost] = React.useState(false);
  const [postDraft, setPostDraft] = React.useState(body ?? '');
  const [postEditMessage, setPostEditMessage] = React.useState<string>('');
  const [isPostPending, startPostTransition] = React.useTransition();

  const [activeReplyTarget, setActiveReplyTarget] = React.useState<
    { kind: 'post' } | { kind: 'comment'; id: number } | null
  >(null);

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
        isOwnerPost && 'bg-neutral-900/10 dark:bg-neutral-200/10',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{createdBy}</span>
          {isOwnerPost && (
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
        <div className="flex items-center gap-2">
          {canEditPost && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px] text-neutral-500 dark:text-neutral-400"
              onClick={(e) => {
                e.stopPropagation();
                setPostEditMessage('');
                setPostDraft(body ?? '');
                setIsEditingPost((v) => !v);
              }}
            >
              {isEditingPost ? 'cancel' : 'edit'}
            </Button>
          )}

          <span className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
            {timeSinceEntry}
          </span>
        </div>
      </div>

      {isEditingPost ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={postDraft}
              onChange={(e) => setPostDraft(e.target.value)}
              maxLength={500}
              className="h-9"
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              disabled={isPostPending}
              onClick={() => {
                startPostTransition(async () => {
                  const res = await editChannelMessage(entry.id, postDraft);
                  setPostEditMessage(res.message);
                  if (res.success) setIsEditingPost(false);
                });
              }}
            >
              save
            </Button>
          </div>

          {postEditMessage && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{postEditMessage}</p>
          )}
        </div>
      ) : (
        <p
          className={cn(
            'text-pretty wrap-break-word',
            canComment && !commentsClosed && 'cursor-pointer',
          )}
          onClick={() => {
            if (!canComment || commentsClosed) return;
            setActiveReplyTarget((prev) => (prev?.kind === 'post' ? null : { kind: 'post' }));
          }}
        >
          {body}
        </p>
      )}

      <div className="flex flex-wrap gap-1">
        {entry.reactions.map((r) => (
          <Button
            key={r.emoji}
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 px-2 text-xs',
              r.reacted && 'bg-neutral-200/20 dark:bg-neutral-900/20',
            )}
            disabled={!canComment}
            onClick={(e) => {
              e.stopPropagation();
              if (!canComment) return;
              setThreads((prev) => toggleReactionInThreads(prev, entry.id, null, r.emoji));
              void toggleChannelReaction(entry.id, null, r.emoji);
            }}
          >
            <span className="flex items-center gap-1">
              <ReactionIcon emoji={r.emoji} />
              {r.count > 0 ? <span>{r.count}</span> : null}
            </span>
          </Button>
        ))}
      </div>

      {(comments.length > 0 || canComment) && (
        <div className="mt-2 border-t border-white/5 pt-3">
          {comments.length > 0 && (
            <div className="space-y-2">
              {comments.map((c) => (
                <ChannelCommentNodeView
                  key={c.id}
                  node={c}
                  messageId={entry.id}
                  canReply={canComment}
                  commentsClosed={commentsClosed}
                  depth={0}
                  activeReplyTarget={activeReplyTarget}
                  setActiveReplyTarget={setActiveReplyTarget}
                  viewerEmail={viewerEmail}
                  setThreads={setThreads}
                />
              ))}
            </div>
          )}

          {canComment && !commentsClosed && activeReplyTarget?.kind === 'post' && (
            <ChannelCommentForm messageId={entry.id} placeholder="write a comment" autoFocus />
          )}
        </div>
      )}
    </motion.div>
  );
}

function ChannelCommentNodeView({
  node,
  messageId,
  canReply,
  commentsClosed,
  depth,
  activeReplyTarget,
  setActiveReplyTarget,
  viewerEmail,
  setThreads,
}: {
  node: ChannelCommentNode;
  messageId: number;
  canReply: boolean;
  commentsClosed: boolean;
  depth: number;
  activeReplyTarget: { kind: 'post' } | { kind: 'comment'; id: number } | null;
  setActiveReplyTarget: React.Dispatch<
    React.SetStateAction<{ kind: 'post' } | { kind: 'comment'; id: number } | null>
  >;
  viewerEmail?: string | null;
  setThreads: React.Dispatch<React.SetStateAction<ChannelThread[]>>;
}) {
  const hasReplies = node.replies.length > 0;
  const clampedDepth = Math.min(depth, 6);
  const isActive = activeReplyTarget?.kind === 'comment' && activeReplyTarget.id === node.id;

  const viewerIsOwner = Boolean(viewerEmail) && viewerEmail === networking.email;
  const canEditComment = Boolean(viewerEmail) && (viewerIsOwner || node.email === viewerEmail);

  const [isEditing, setIsEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(node.body ?? '');
  const [editMessage, setEditMessage] = React.useState<string>('');
  const [isPending, startTransition] = React.useTransition();

  return (
    <div
      className="space-y-2"
      style={{
        marginLeft: clampedDepth * 12,
      }}
    >
      <div
        className={cn(
          'rounded-xl bg-neutral-200/10 px-3 py-2 text-xs leading-5 dark:bg-neutral-900/10',
          canReply && !commentsClosed && 'cursor-pointer',
        )}
        onClick={() => {
          if (!canReply || commentsClosed) return;
          setActiveReplyTarget((prev) =>
            prev?.kind === 'comment' && prev.id === node.id
              ? null
              : { kind: 'comment', id: node.id },
          );
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-neutral-500 dark:text-neutral-400">{node.createdBy}</span>
          <div className="flex items-center gap-2">
            {canEditComment && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] text-neutral-500 dark:text-neutral-400"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditMessage('');
                  setDraft(node.body ?? '');
                  setIsEditing((v) => !v);
                }}
              >
                {isEditing ? 'cancel' : 'edit'}
              </Button>
            )}

            <span className="text-neutral-500 dark:text-neutral-400">
              {differenceInDays(new Date(), node.createdAt) > 0
                ? `${differenceInDays(new Date(), node.createdAt)}d ago`
                : 'today'}
            </span>
          </div>
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <div className="flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={500}
                className="h-8"
                autoFocus
              />
              <Button
                type="button"
                size="sm"
                className="h-8"
                disabled={isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  startTransition(async () => {
                    const res = await editChannelComment(node.id, draft);
                    setEditMessage(res.message);
                    if (res.success) setIsEditing(false);
                  });
                }}
              >
                save
              </Button>
            </div>
            {editMessage && (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{editMessage}</p>
            )}
          </div>
        ) : (
          <p className="wrap-break-word">{node.body}</p>
        )}

        <div className="mt-2 flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
          {node.reactions.map((r) => (
            <Button
              key={r.emoji}
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                'h-6 px-2 text-[11px]',
                r.reacted && 'bg-neutral-200/20 dark:bg-neutral-900/20',
              )}
              disabled={!canReply}
              onClick={() => {
                if (!canReply) return;
                setThreads((prev) => toggleReactionInThreads(prev, messageId, node.id, r.emoji));
                void toggleChannelReaction(messageId, node.id, r.emoji);
              }}
            >
              <span className="flex items-center gap-1">
                <ReactionIcon emoji={r.emoji} />
                {r.count > 0 ? <span>{r.count}</span> : null}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {isActive && canReply && !commentsClosed && (
        <ChannelCommentForm
          messageId={messageId}
          parentCommentId={node.id}
          placeholder="write a reply"
          autoFocus
        />
      )}

      {hasReplies && (
        <div className="space-y-2">
          {node.replies.map((r) => (
            <ChannelCommentNodeView
              key={r.id}
              node={r}
              messageId={messageId}
              canReply={canReply}
              commentsClosed={commentsClosed}
              depth={depth + 1}
              activeReplyTarget={activeReplyTarget}
              setActiveReplyTarget={setActiveReplyTarget}
              viewerEmail={viewerEmail}
              setThreads={setThreads}
            />
          ))}
        </div>
      )}
    </div>
  );
}
