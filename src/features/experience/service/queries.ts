import 'server-only';

import { desc, isNull } from 'drizzle-orm';

import { db } from '@/db';
import { experience } from '@/db/schema';

import type { Experience } from '../model/types';

export async function getExperiences(): Promise<Experience[]> {
  return db
    .select({
      id: experience.id,
      workType: experience.workType,
      companyName: experience.companyName,
      companyUrl: experience.companyUrl,
      position: experience.position,
      description: experience.description,
      targetTask: experience.targetTask,
      stack: experience.stack,
      joinedAt: experience.joinedAt,
      leftAt: experience.leftAt,
    })
    .from(experience)
    .orderBy(desc(experience.joinedAt));
}

export async function getCurrentExperience(): Promise<Experience | null> {
  const rows = await db
    .select({
      id: experience.id,
      workType: experience.workType,
      companyName: experience.companyName,
      companyUrl: experience.companyUrl,
      position: experience.position,
      description: experience.description,
      targetTask: experience.targetTask,
      stack: experience.stack,
      joinedAt: experience.joinedAt,
      leftAt: experience.leftAt,
    })
    .from(experience)
    .where(isNull(experience.leftAt))
    .orderBy(desc(experience.joinedAt))
    .limit(1);

  return rows[0] ?? null;
}
