import '@/lib/config';

import { db } from '@/app/db';
import { experience } from '@/app/db/schema';
import { and, eq } from 'drizzle-orm';

type SeedExperience = {
  workType?: 'company' | 'project' | 'contract';
  companyName: string;
  companyUrl: string;
  position: string;
  description: string;
  targetTask?: string;
  stack?: string;
  joinedAt: Date;
  leftAt: Date | null;
};

const seedData: SeedExperience[] = [
  {
    workType: 'company',
    companyName: 'Insider Team',
    companyUrl: 'https://www.insiders.software',
    position: 'Backend Developer',
    description:
      'I joined the Insider Team to develop my experience and work on various projects as part of a team.',
    targetTask: 'Build and maintain backend services for product features.',
    stack: 'TypeScript, SQL, Next.js, drizzle-orm, PostgreSQL, Docker, Git',
    joinedAt: new Date('2025-01-01T00:00:00.000Z'),
    leftAt: null,
  },
  {
    workType: 'company',
    companyName: 'Assisterr',
    companyUrl: 'https://assisterr.ai',
    position: 'Backend/Service Developer',
    description:
      'I joined the Assisterr team to help build automation, accessibility, and uniqueness in the product.',
    targetTask: 'Ship reliable services that automate key product flows.',
    stack: 'TypeScript, SQL, PostgreSQL, Docker, Git',
    joinedAt: new Date('2021-01-01T00:00:00.000Z'),
    leftAt: new Date('2024-12-31T00:00:00.000Z'),
  },
];

async function seed() {
  for (const item of seedData) {
    const existing = await db
      .select({
        id: experience.id,
        workType: experience.workType,
        companyUrl: experience.companyUrl,
        description: experience.description,
        targetTask: experience.targetTask,
        stack: experience.stack,
        leftAt: experience.leftAt,
      })
      .from(experience)
      .where(
        and(
          eq(experience.companyName, item.companyName),
          eq(experience.position, item.position),
          eq(experience.joinedAt, item.joinedAt),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      const row = existing[0];

      const update: Record<string, unknown> = {};

      if (row.workType == null && item.workType) update.workType = item.workType;
      if (row.companyUrl == null && item.companyUrl) update.companyUrl = item.companyUrl;
      if (row.description == null && item.description) update.description = item.description;
      if (row.targetTask == null && item.targetTask) update.targetTask = item.targetTask;
      if (row.stack == null && item.stack) update.stack = item.stack;
      if (row.leftAt == null && item.leftAt != null) update.leftAt = item.leftAt;

      if (Object.keys(update).length > 0) {
        await db.update(experience).set(update).where(eq(experience.id, row.id));
      }

      continue;
    }

    await db.insert(experience).values({
      workType: item.workType ?? 'company',
      companyName: item.companyName,
      companyUrl: item.companyUrl,
      position: item.position,
      description: item.description,
      targetTask: item.targetTask ?? null,
      stack: item.stack ?? null,
      joinedAt: item.joinedAt,
      leftAt: item.leftAt,
    });
  }
}

seed()
  .then(() => {
    console.log('Seeded experience');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
