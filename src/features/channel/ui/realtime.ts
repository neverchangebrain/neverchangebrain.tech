'use client';

import * as React from 'react';

import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

import { CHANNEL_REACTION_EMOJIS } from '../model/types';

import type { ChannelCommentNode, ChannelReaction, ChannelThread } from '../model/types';

function defaultReactions(): ChannelReaction[] {
  return CHANNEL_REACTION_EMOJIS.map((emoji) => ({ emoji, count: 0, reacted: false }));
}

type GuestbookRow = {
  id: number;
  email: string | null;
  body: string | null;
  createdBy: string | null;
  createdAt: string | Date;
  isPinned: boolean;
  commentsClosed: boolean;
};

type ChannelCommentRow = {
  id: number;
  messageId: number;
  parentId: number | null;
  email: string | null;
  body: string | null;
  createdBy: string | null;
  createdAt: string | Date;
};

type ChannelReactionRow = {
  id: number;
  messageId: number;
  commentId: number | null;
  emoji: string;
  email: string;
  createdAt: string | Date;
};

function toDate(v: string | Date) {
  return v instanceof Date ? v : new Date(v);
}

function sortThreads(threads: ChannelThread[]) {
  return [...threads].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;

    const dt = b.createdAt.getTime() - a.createdAt.getTime();
    if (dt !== 0) return dt;
    return b.id - a.id;
  });
}

function upsertThreadFromRow(threads: ChannelThread[], row: GuestbookRow): ChannelThread[] {
  const createdAt = toDate(row.createdAt);

  const next = threads.map((t) =>
    t.id === row.id
      ? {
          ...t,
          email: row.email,
          body: row.body,
          createdBy: row.createdBy,
          createdAt,
          isPinned: row.isPinned,
          commentsClosed: row.commentsClosed,
        }
      : t,
  );

  const exists = next.some((t) => t.id === row.id);
  if (exists) return sortThreads(next);

  return sortThreads([
    {
      id: row.id,
      email: row.email,
      body: row.body,
      createdBy: row.createdBy,
      createdAt,
      isPinned: row.isPinned,
      commentsClosed: row.commentsClosed,
      reactions: defaultReactions(),
      comments: [],
    },
    ...next,
  ]);
}

function deleteThreadById(threads: ChannelThread[], id: number): ChannelThread[] {
  return threads.filter((t) => t.id !== id);
}

function insertSortedByCreatedAt(list: ChannelCommentNode[], node: ChannelCommentNode) {
  const next = [...list, node];
  next.sort((a, b) => {
    const dt = a.createdAt.getTime() - b.createdAt.getTime();
    if (dt !== 0) return dt;
    return a.id - b.id;
  });
  return next;
}

function normalizeCommentRoots(roots: ChannelCommentNode[]): ChannelCommentNode[] {
  const all: ChannelCommentNode[] = [];
  const stack = [...roots];

  while (stack.length) {
    const n = stack.pop();
    if (!n) continue;
    all.push(n);
    for (const r of n.replies ?? []) stack.push(r);
  }

  const byId = new Map<number, ChannelCommentNode>();
  for (const n of all) {
    byId.set(n.id, {
      ...n,
      createdAt: toDate(n.createdAt as unknown as string | Date),
      reactions: n.reactions ?? defaultReactions(),
      replies: [],
    });
  }

  const nextRoots: ChannelCommentNode[] = [];
  for (const n of byId.values()) {
    if (n.parentId && byId.has(n.parentId)) {
      byId.get(n.parentId)!.replies.push(n);
    } else {
      nextRoots.push(n);
    }
  }

  const sortDeep = (nodes: ChannelCommentNode[]) => {
    nodes.sort((a, b) => {
      const dt = a.createdAt.getTime() - b.createdAt.getTime();
      if (dt !== 0) return dt;
      return a.id - b.id;
    });
    for (const n of nodes) sortDeep(n.replies);
  };

  sortDeep(nextRoots);
  return nextRoots;
}

function upsertCommentInTree(
  nodes: ChannelCommentNode[],
  row: ChannelCommentRow,
): { next: ChannelCommentNode[]; handled: boolean } {
  const createdAt = toDate(row.createdAt);

  // update existing node
  for (const n of nodes) {
    if (n.id === row.id) {
      n.email = row.email;
      n.body = row.body;
      n.createdBy = row.createdBy;
      n.createdAt = createdAt;
      n.parentId = row.parentId;
      return { next: nodes, handled: true };
    }
  }

  // insert as reply to parent if found
  if (row.parentId) {
    for (const n of nodes) {
      if (n.id === row.parentId) {
        const newNode: ChannelCommentNode = {
          id: row.id,
          messageId: row.messageId,
          parentId: row.parentId,
          email: row.email,
          body: row.body,
          createdBy: row.createdBy,
          createdAt,
          reactions: defaultReactions(),
          replies: [],
        };
        n.replies = insertSortedByCreatedAt(n.replies, newNode);
        return { next: nodes, handled: true };
      }

      const child = upsertCommentInTree(n.replies, row);
      if (child.handled) {
        n.replies = child.next;
        return { next: nodes, handled: true };
      }
    }

    // parent not in tree (yet) -> treat as root
  }

  const newNode: ChannelCommentNode = {
    id: row.id,
    messageId: row.messageId,
    parentId: row.parentId,
    email: row.email,
    body: row.body,
    createdBy: row.createdBy,
    createdAt,
    reactions: defaultReactions(),
    replies: [],
  };

  return { next: insertSortedByCreatedAt(nodes, newNode), handled: true };
}

function upsertCommentFromRow(threads: ChannelThread[], row: ChannelCommentRow): ChannelThread[] {
  return threads.map((t) => {
    if (t.id !== row.messageId) return t;

    // clone shallowly to avoid mutating state
    const comments = structuredClone(t.comments) as ChannelCommentNode[];
    const res = upsertCommentInTree(comments, row);

    return {
      ...t,
      comments: normalizeCommentRoots(res.next),
    };
  });
}

type RemoveResult = {
  next: ChannelCommentNode[];
  promoted: ChannelCommentNode[];
  removed: boolean;
};

function removeCommentFromTree(nodes: ChannelCommentNode[], id: number): RemoveResult {
  const next: ChannelCommentNode[] = [];

  for (const n of nodes) {
    if (n.id === id) {
      // Promote its replies to the same level (keeps them visible like the DB tree-builder would).
      const promoted = n.replies ?? [];
      return { next: [...next, ...promoted], promoted, removed: true };
    }

    const child = removeCommentFromTree(n.replies ?? [], id);
    if (child.removed) {
      const newNode = { ...n, replies: child.next };
      next.push(newNode);
      return { next, promoted: child.promoted, removed: true };
    }

    next.push(n);
  }

  return { next, promoted: [], removed: false };
}

function deleteCommentById(
  threads: ChannelThread[],
  messageId: number,
  commentId: number,
): ChannelThread[] {
  return threads.map((t) => {
    if (t.id !== messageId) return t;
    const cloned = structuredClone(t.comments) as ChannelCommentNode[];
    const res = removeCommentFromTree(cloned, commentId);
    if (!res.removed) return t;

    return {
      ...t,
      comments: normalizeCommentRoots(res.next),
    };
  });
}

function bumpReaction(
  reactions: ChannelReaction[],
  emoji: string,
  delta: number,
  reactedDelta: boolean | null,
): ChannelReaction[] {
  const allowed = new Set<string>(CHANNEL_REACTION_EMOJIS);
  if (!allowed.has(emoji)) return reactions;

  return reactions.map((r) => {
    if (r.emoji !== (emoji as any)) return r;
    const nextCount = Math.max(0, (r.count ?? 0) + delta);
    const nextReacted = reactedDelta === null ? r.reacted : reactedDelta;
    return {
      ...r,
      count: nextCount,
      reacted: nextReacted,
    };
  });
}

function updateCommentNodeReaction(
  nodes: ChannelCommentNode[],
  commentId: number,
  emoji: string,
  delta: number,
  reactedDelta: boolean | null,
): ChannelCommentNode[] {
  return nodes.map((n) => {
    if (n.id === commentId) {
      return {
        ...n,
        reactions: bumpReaction(n.reactions ?? defaultReactions(), emoji, delta, reactedDelta),
      };
    }
    if (n.replies?.length) {
      return {
        ...n,
        replies: updateCommentNodeReaction(n.replies, commentId, emoji, delta, reactedDelta),
      };
    }
    return n;
  });
}

function applyReactionDelta(
  threads: ChannelThread[],
  row: ChannelReactionRow,
  delta: number,
  viewerEmail?: string | null,
): ChannelThread[] {
  const reactedDelta = viewerEmail && row.email === viewerEmail ? delta > 0 : null;

  return threads.map((t) => {
    if (t.id !== row.messageId) return t;

    if (!row.commentId) {
      return {
        ...t,
        reactions: bumpReaction(t.reactions ?? defaultReactions(), row.emoji, delta, reactedDelta),
      };
    }

    return {
      ...t,
      comments: updateCommentNodeReaction(
        t.comments ?? [],
        row.commentId,
        row.emoji,
        delta,
        reactedDelta,
      ),
    };
  });
}

export function useChannelRealtime(
  setThreads: React.Dispatch<React.SetStateAction<ChannelThread[]>>,
  viewerEmail?: string | null,
) {
  React.useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const reactionById = new Map<number, ChannelReactionRow>();

    const channel = supabase
      .channel('channel-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guestbook' }, (payload) => {
        setThreads((prev) => {
          if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as Partial<GuestbookRow>;
            if (!oldRow?.id) return prev;
            return deleteThreadById(prev, Number(oldRow.id));
          }

          const row = payload.new as GuestbookRow;
          if (!row?.id) return prev;
          return upsertThreadFromRow(prev, row);
        });
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'channelComments' },
        (payload) => {
          setThreads((prev) => {
            if (payload.eventType === 'DELETE') {
              const oldRow = payload.old as Partial<ChannelCommentRow>;
              if (!oldRow?.id || !oldRow?.messageId) return prev;
              return deleteCommentById(prev, Number(oldRow.messageId), Number(oldRow.id));
            }

            const row = payload.new as ChannelCommentRow;
            if (!row?.id || !row?.messageId) return prev;
            return upsertCommentFromRow(prev, row);
          });
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'channelReactions' },
        (payload) => {
          setThreads((prev) => {
            if (payload.eventType === 'DELETE') {
              const oldRow = payload.old as Partial<ChannelReactionRow>;
              const id = oldRow?.id ? Number(oldRow.id) : null;

              const fromCache = id ? reactionById.get(id) : undefined;
              const row = (
                oldRow?.messageId && oldRow?.emoji && oldRow.commentId !== undefined
                  ? (oldRow as ChannelReactionRow)
                  : fromCache
              ) as ChannelReactionRow | undefined;

              if (!row?.messageId || !row?.emoji || row.commentId === undefined) return prev;

              if (id) reactionById.delete(id);
              return applyReactionDelta(prev, row, -1, viewerEmail);
            }

            const row = payload.new as ChannelReactionRow;
            if (!row?.messageId || !row?.emoji) return prev;

            if (row?.id) reactionById.set(Number(row.id), row);
            return applyReactionDelta(prev, row, 1, viewerEmail);
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [setThreads, viewerEmail]);
}
