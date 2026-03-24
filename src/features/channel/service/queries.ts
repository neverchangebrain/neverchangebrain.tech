import 'server-only';

import { asc, desc, inArray } from 'drizzle-orm';

import { db } from '@/db';
import { channelComments, channelMessages } from '@/db/schema';

import type { ChannelComment, ChannelCommentNode, ChannelThread } from '../model/types';

export async function getChannelThreads(): Promise<ChannelThread[]> {
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
    .orderBy(desc(channelMessages.isPinned), desc(channelMessages.createdAt));

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
    .orderBy(asc(channelComments.createdAt));

  const commentsByMessageId = new Map<number, ChannelComment[]>();
  for (const c of comments) {
    const list = commentsByMessageId.get(c.messageId) ?? [];
    list.push(c);
    commentsByMessageId.set(c.messageId, list);
  }

  function buildTree(messageComments: ChannelComment[]): ChannelCommentNode[] {
    const nodes = new Map<number, ChannelCommentNode>();

    for (const c of messageComments) {
      nodes.set(c.id, { ...c, replies: [] });
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
    return {
      ...m,
      comments: buildTree(messageComments),
    };
  });
}
