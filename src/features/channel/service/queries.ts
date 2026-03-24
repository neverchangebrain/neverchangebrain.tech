import 'server-only';

import { asc, desc, inArray } from 'drizzle-orm';

import { db } from '@/db';
import { channelComments, channelMessages } from '@/db/schema';

import type { ChannelThread } from '../model/types';

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
      email: channelComments.email,
      body: channelComments.body,
      createdBy: channelComments.createdBy,
      createdAt: channelComments.createdAt,
    })
    .from(channelComments)
    .where(inArray(channelComments.messageId, messageIds))
    .orderBy(asc(channelComments.createdAt));

  const byMessageId = new Map<number, typeof comments>();
  for (const c of comments) {
    const list = byMessageId.get(c.messageId) ?? [];
    list.push(c);
    byMessageId.set(c.messageId, list);
  }

  return messages.map((m) => ({
    ...m,
    comments: byMessageId.get(m.id) ?? [],
  }));
}
