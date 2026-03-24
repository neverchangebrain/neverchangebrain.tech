'use server';

import { differenceInMinutes } from 'date-fns';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { type Session } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';

import { auth } from '@/auth';
import { networking } from '@/constants/profile';
import { db } from '@/db';
import { channelComments, channelMessages, channelReactions } from '@/db/schema';
import { env } from '@/env';

import { CHANNEL_REACTION_EMOJIS } from '../model/types';

type ActionResult = {
  success: boolean;
  message: string;
};

async function requireSession(): Promise<Session> {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  return session;
}

async function requireOwnerSession(): Promise<Session> {
  const session = await requireSession();
  const email = session.user?.email as string | undefined;
  if (!email || email !== networking.email) {
    throw new Error('Forbidden');
  }
  return session;
}

const OWNER_EMAIL = networking.email;
const COOLDOWN_MINUTES = 15;

async function getPostCooldown(email: string) {
  const now = new Date();

  if (email === OWNER_EMAIL) {
    return { canPost: true, minutesToPostAgain: 0 };
  }

  const last = await db
    .select({ createdAt: channelMessages.createdAt })
    .from(channelMessages)
    .where(eq(channelMessages.email, email))
    .orderBy(desc(channelMessages.createdAt))
    .limit(1);

  if (!last.length) {
    return { canPost: true, minutesToPostAgain: 0 };
  }

  const minutesSinceLastPost = differenceInMinutes(now, last[0].createdAt);

  if (minutesSinceLastPost < COOLDOWN_MINUTES) {
    return {
      canPost: false,
      minutesToPostAgain: COOLDOWN_MINUTES - minutesSinceLastPost,
    };
  }

  return { canPost: true, minutesToPostAgain: 0 };
}

const resend = new Resend(env.RESEND_API_KEY);

export async function saveChannelMessage(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  if (!session.user) throw new Error('Unauthorized');

  const email = session.user.email as string;
  const createdBy = session.user.name || email || 'Anonymous';

  const { canPost, minutesToPostAgain } = await getPostCooldown(email);

  if (!canPost) {
    return {
      success: false,
      message: `You can post again in ${minutesToPostAgain} min.`,
    };
  }

  const entry = formData.get('entry')?.toString() || '';
  const body = entry.slice(0, 500).trim();

  if (!body) {
    return {
      success: false,
      message: 'Message cannot be empty',
    };
  }

  try {
    await db.insert(channelMessages).values({
      createdBy,
      email,
      body,
    });

    await resend.emails.send({
      from: `Channel <admin@neverchangebrain.engineer>`,
      to: [OWNER_EMAIL],
      subject: 'Channel: new message',
      text: `From: ${createdBy}\nEntry: ${body}`,
    });
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Failed to save message',
    };
  }

  revalidatePath('/channel');
  return { success: true, message: 'Sent' };
}

export async function saveChannelComment(
  messageId: number,
  parentCommentId: number | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession();
  if (!session.user) throw new Error('Unauthorized');

  const email = session.user.email as string;
  const createdBy = session.user.name || email || 'Anonymous';

  const entry = formData.get('entry')?.toString() || '';
  const body = entry.slice(0, 500).trim();

  if (!body) {
    return {
      success: false,
      message: 'Comment cannot be empty',
    };
  }

  const rows = await db
    .select({ id: channelMessages.id, commentsClosed: channelMessages.commentsClosed })
    .from(channelMessages)
    .where(eq(channelMessages.id, messageId))
    .limit(1);

  const msg = rows[0];
  if (!msg) {
    return { success: false, message: 'Post not found' };
  }
  if (msg.commentsClosed) {
    return { success: false, message: 'Comments are closed' };
  }

  if (parentCommentId) {
    const parentRows = await db
      .select({ id: channelComments.id, messageId: channelComments.messageId })
      .from(channelComments)
      .where(eq(channelComments.id, parentCommentId))
      .limit(1);

    const parent = parentRows[0];
    if (!parent || parent.messageId !== messageId) {
      return { success: false, message: 'Invalid parent comment' };
    }
  }

  try {
    await db.insert(channelComments).values({
      messageId,
      parentId: parentCommentId,
      createdBy,
      email,
      body,
    });
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Failed to save comment',
    };
  }

  revalidatePath('/channel');
  return { success: true, message: 'Sent' };
}

export async function adminDeleteChannelMessage(formData: FormData): Promise<void> {
  await requireOwnerSession();
  const id = Number(formData.get('id'));
  if (!id || Number.isNaN(id)) throw new Error('Invalid id');

  await db.delete(channelMessages).where(eq(channelMessages.id, id));
  revalidatePath('/channel');
  revalidatePath('/channel/admin');
}

export async function adminDeleteChannelComment(formData: FormData): Promise<void> {
  await requireOwnerSession();
  const id = Number(formData.get('id'));
  if (!id || Number.isNaN(id)) throw new Error('Invalid id');

  await db.delete(channelComments).where(eq(channelComments.id, id));
  revalidatePath('/channel');
  revalidatePath('/channel/admin');
}

export async function adminToggleChannelMessagePinned(formData: FormData): Promise<void> {
  await requireOwnerSession();
  const id = Number(formData.get('id'));
  if (!id || Number.isNaN(id)) throw new Error('Invalid id');

  const rows = await db
    .select({ isPinned: channelMessages.isPinned })
    .from(channelMessages)
    .where(eq(channelMessages.id, id))
    .limit(1);
  if (!rows[0]) return;

  await db
    .update(channelMessages)
    .set({ isPinned: !rows[0].isPinned })
    .where(eq(channelMessages.id, id));

  revalidatePath('/channel');
  revalidatePath('/channel/admin');
}

export async function adminToggleChannelMessageCommentsClosed(formData: FormData): Promise<void> {
  await requireOwnerSession();
  const id = Number(formData.get('id'));
  if (!id || Number.isNaN(id)) throw new Error('Invalid id');

  const rows = await db
    .select({ commentsClosed: channelMessages.commentsClosed })
    .from(channelMessages)
    .where(eq(channelMessages.id, id))
    .limit(1);
  if (!rows[0]) return;

  await db
    .update(channelMessages)
    .set({ commentsClosed: !rows[0].commentsClosed })
    .where(eq(channelMessages.id, id));

  revalidatePath('/channel');
  revalidatePath('/channel/admin');
}

export async function adminClearChannelReactions(formData: FormData): Promise<void> {
  await requireOwnerSession();

  const messageId = Number(formData.get('messageId'));
  if (!messageId || Number.isNaN(messageId)) throw new Error('Invalid messageId');

  const rawCommentId = formData.get('commentId');
  const commentId = rawCommentId ? Number(rawCommentId) : null;
  if (rawCommentId && (!commentId || Number.isNaN(commentId))) throw new Error('Invalid commentId');

  await db
    .delete(channelReactions)
    .where(
      and(
        eq(channelReactions.messageId, messageId),
        commentId ? eq(channelReactions.commentId, commentId) : isNull(channelReactions.commentId),
      ),
    );

  revalidatePath('/channel');
  revalidatePath('/channel/admin');
}

export async function toggleChannelReaction(
  messageId: number,
  commentId: number | null,
  emoji: string,
): Promise<ActionResult> {
  const session = await requireSession();
  if (!session.user) throw new Error('Unauthorized');

  const email = session.user.email as string;

  if (!CHANNEL_REACTION_EMOJIS.includes(emoji as any)) {
    return { success: false, message: 'Invalid reaction' };
  }

  const exists = await db
    .select({ id: channelReactions.id })
    .from(channelReactions)
    .where(
      and(
        eq(channelReactions.messageId, messageId),
        commentId ? eq(channelReactions.commentId, commentId) : isNull(channelReactions.commentId),
        eq(channelReactions.emoji, emoji),
        eq(channelReactions.email, email),
      ),
    )
    .limit(1);

  try {
    if (exists[0]) {
      await db.delete(channelReactions).where(eq(channelReactions.id, exists[0].id));
    } else {
      await db.insert(channelReactions).values({
        messageId,
        commentId,
        emoji,
        email,
      });
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to react' };
  }

  revalidatePath('/channel');
  revalidatePath('/channel/admin');
  return { success: true, message: 'OK' };
}

export async function editChannelMessage(
  messageId: number,
  nextBody: string,
): Promise<ActionResult> {
  const session = await requireSession();
  if (!session.user) throw new Error('Unauthorized');

  const email = session.user.email as string;
  const body = nextBody.slice(0, 500).trim();
  if (!body) return { success: false, message: 'Message cannot be empty' };

  const rows = await db
    .select({ email: channelMessages.email })
    .from(channelMessages)
    .where(eq(channelMessages.id, messageId))
    .limit(1);

  const row = rows[0];
  if (!row) return { success: false, message: 'Post not found' };

  const isOwner = email === OWNER_EMAIL;
  if (!isOwner && row.email !== email) return { success: false, message: 'Forbidden' };

  try {
    await db.update(channelMessages).set({ body }).where(eq(channelMessages.id, messageId));
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to edit' };
  }

  revalidatePath('/channel');
  revalidatePath('/channel/admin');
  return { success: true, message: 'Saved' };
}

export async function editChannelComment(
  commentId: number,
  nextBody: string,
): Promise<ActionResult> {
  const session = await requireSession();
  if (!session.user) throw new Error('Unauthorized');

  const email = session.user.email as string;
  const body = nextBody.slice(0, 500).trim();
  if (!body) return { success: false, message: 'Comment cannot be empty' };

  const rows = await db
    .select({ email: channelComments.email })
    .from(channelComments)
    .where(eq(channelComments.id, commentId))
    .limit(1);

  const row = rows[0];
  if (!row) return { success: false, message: 'Comment not found' };

  const isOwner = email === OWNER_EMAIL;
  if (!isOwner && row.email !== email) return { success: false, message: 'Forbidden' };

  try {
    await db.update(channelComments).set({ body }).where(eq(channelComments.id, commentId));
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to edit' };
  }

  revalidatePath('/channel');
  revalidatePath('/channel/admin');
  return { success: true, message: 'Saved' };
}
