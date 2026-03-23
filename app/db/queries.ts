import { db } from '@/app/db';
import { channelMessages, experience } from '@/app/db/schema';
import { desc } from 'drizzle-orm';

export async function getGuestbookEntries() {
  return db.select().from(channelMessages).limit(100).orderBy(desc(channelMessages.createdAt));
}

export async function getChannelMessages() {
  return getGuestbookEntries();
}

export async function getExperiences() {
  return db.select().from(experience).orderBy(desc(experience.joinedAt));
}
