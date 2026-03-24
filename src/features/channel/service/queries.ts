import 'server-only';

import { asc, desc, inArray } from 'drizzle-orm';

import { db } from '@/db';
import { channelComments, channelMessages, channelReactions } from '@/db/schema';

import { CHANNEL_REACTION_EMOJIS } from '../model/types';

import type {
  ChannelComment,
  ChannelCommentNode,
  ChannelReaction,
  ChannelReactionEmoji,
  ChannelThread,
} from '../model/types';

type DbChannelComment = Omit<ChannelComment, 'reactions'>;

function emptyReactions(): ChannelReaction[] {
  return CHANNEL_REACTION_EMOJIS.map((emoji) => ({ emoji, count: 0, reacted: false }));
}

function mergeReactions(
  base: ChannelReaction[],
  updates: Map<ChannelReactionEmoji, { count: number; reacted: boolean }>,
): ChannelReaction[] {
  return base.map((r) => {
    const u = updates.get(r.emoji);
    return u ? { ...r, count: u.count, reacted: u.reacted } : r;
  });
}

export async function getChannelThreads(viewerEmail?: string | null): Promise<ChannelThread[]> {
  const messages = await db
    .select({
      id: channelMessages.id,
      email: channelMessages.email,
      body: channelMessages.body,
      createdBy: channelMessages.createdBy,
      createdAt: channelMessages.createdAt,
      isPinned: channelMessages.isPinned,
      commentsClosed: channelMessages.commentsClosed,
    })
    .from(channelMessages)
    .limit(100)
    .orderBy(
      desc(channelMessages.isPinned),
      desc(channelMessages.createdAt),
      desc(channelMessages.id),
    );

  const messageIds = messages.map((m) => m.id);
  if (!messageIds.length) return [];

  const comments = await db
    .select({
      id: channelComments.id,
      messageId: channelComments.messageId,
      parentId: channelComments.parentId,
      email: channelComments.email,
      body: channelComments.body,
      createdBy: channelComments.createdBy,
      createdAt: channelComments.createdAt,
    })
    .from(channelComments)
    .where(inArray(channelComments.messageId, messageIds))
    .orderBy(asc(channelComments.createdAt), asc(channelComments.id));

  const commentIds = comments.map((c) => c.id);

  const reactions = await db
    .select({
      messageId: channelReactions.messageId,
      commentId: channelReactions.commentId,
      emoji: channelReactions.emoji,
      email: channelReactions.email,
    })
    .from(channelReactions)
    .where(inArray(channelReactions.messageId, messageIds));

  const messageReactions = new Map<
    number,
    Map<ChannelReactionEmoji, { count: number; reacted: boolean }>
  >();
  const commentReactions = new Map<
    number,
    Map<ChannelReactionEmoji, { count: number; reacted: boolean }>
  >();
  const allowed = new Set<string>(CHANNEL_REACTION_EMOJIS);

  const commentIdSet = new Set<number>(commentIds);

  for (const r of reactions) {
    if (!allowed.has(r.emoji)) continue;
    const emoji = r.emoji as ChannelReactionEmoji;
    const isViewer = Boolean(viewerEmail) && r.email === viewerEmail;

    if (r.commentId && commentIdSet.has(r.commentId)) {
      const map = commentReactions.get(r.commentId) ?? new Map();
      const prev = map.get(emoji) ?? { count: 0, reacted: false };
      map.set(emoji, { count: prev.count + 1, reacted: prev.reacted || isViewer });
      commentReactions.set(r.commentId, map);
      continue;
    }

    const map = messageReactions.get(r.messageId) ?? new Map();
    const prev = map.get(emoji) ?? { count: 0, reacted: false };
    map.set(emoji, { count: prev.count + 1, reacted: prev.reacted || isViewer });
    messageReactions.set(r.messageId, map);
  }

  const commentsByMessageId = new Map<number, DbChannelComment[]>();
  for (const c of comments) {
    const list = commentsByMessageId.get(c.messageId) ?? [];
    list.push(c);
    commentsByMessageId.set(c.messageId, list);
  }

  function buildTree(messageComments: DbChannelComment[]): ChannelCommentNode[] {
    const nodes = new Map<number, ChannelCommentNode>();

    const base = emptyReactions();

    for (const c of messageComments) {
      const r = commentReactions.get(c.id) ?? new Map();
      nodes.set(c.id, { ...c, reactions: mergeReactions(base, r), replies: [] });
    }

    const roots: ChannelCommentNode[] = [];
    for (const c of messageComments) {
      const node = nodes.get(c.id);
      if (!node) continue;

      if (c.parentId) {
        const parent = nodes.get(c.parentId);
        if (parent) parent.replies.push(node);
        else roots.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  return messages.map((m) => {
    const messageComments = commentsByMessageId.get(m.id) ?? [];
    const base = emptyReactions();
    const r = messageReactions.get(m.id) ?? new Map();
    return {
      ...m,
      reactions: mergeReactions(base, r),
      comments: buildTree(messageComments),
    };
  });
}
