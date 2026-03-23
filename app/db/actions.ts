'use server';

import { differenceInMinutes } from 'date-fns';
import { desc, eq } from 'drizzle-orm';
import { Session } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';

import { auth } from '@/app/auth';
import { db } from '@/app/db';
import { channelMessages } from '@/app/db/schema';
import { env } from '@/app/env';
import { networking } from '@/lib/constants';

async function getSession(): Promise<Session> {
  let session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
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

  const lastSignage = await db
    .select()
    .from(channelMessages)
    .where(eq(channelMessages.email, email))
    .orderBy(desc(channelMessages.createdAt))
    .limit(1);

  if (!lastSignage.length) {
    return { canPost: true, minutesToPostAgain: 0 };
  }

  const minutesSinceLastPost = differenceInMinutes(now, lastSignage[0].createdAt);

  if (minutesSinceLastPost < COOLDOWN_MINUTES) {
    return {
      canPost: false,
      minutesToPostAgain: COOLDOWN_MINUTES - minutesSinceLastPost,
    };
  }

  return { canPost: true, minutesToPostAgain: 0 };
}

const resend = new Resend(env.RESEND_API_KEY);

export async function saveGuestbookEntry(formData: FormData) {
  return saveChannelMessage(formData);
}

export async function saveChannelMessage(formData: FormData) {
  let session = await getSession();
  if (!session.user) throw new Error('Unauthorized');

  let email = session.user.email as string;
  let createdBy = session.user.name || email || 'Anonymous';

  const { canPost, minutesToPostAgain } = await getPostCooldown(email);

  if (!canPost) {
    return {
      success: false,
      message: `You can post again in ${minutesToPostAgain} min.`,
    };
  }

  let entry = formData.get('entry')?.toString() || '';
  let body = entry.slice(0, 500).trim();

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
