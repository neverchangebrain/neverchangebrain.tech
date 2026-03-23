import { getExperiences } from '@/app/db/queries';
import { Jobs } from '@/app/work/components/jobs';
import { WorkShell } from '@/app/work/components/work-shell';
import { Heading } from '@/components/heading';
import { defaultVariants } from '@/components/motion.variants';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Work - Nazar',
  description: "Learn more about my work experience and what I'm currently working on.",
};

export default async function WorkPage() {
  const experiences = await getExperiences();

  const jobs = experiences.map((exp) => {
    const fromYear = exp.joinedAt ? new Date(exp.joinedAt).getFullYear().toString() : '';
    const toYear = exp.leftAt ? new Date(exp.leftAt).getFullYear().toString() : 'Present';

    return {
      id: exp.id,
      workType: exp.workType ?? 'company',
      companyName: exp.companyName ?? '',
      companyUrl: exp.companyUrl ?? null,
      position: exp.position ?? '',
      description: exp.description ?? null,
      targetTask: exp.targetTask ?? null,
      stack: exp.stack ?? null,
      joinedAt: exp.joinedAt ? new Date(exp.joinedAt).toISOString() : null,
      leftAt: exp.leftAt ? new Date(exp.leftAt).toISOString() : null,
      from: fromYear,
      to: toYear,
      current: exp.leftAt == null,
    };
  });

  return (
    <section>
      <Heading className="mb-1 mt-0">My work experience</Heading>

      <WorkShell initial="hidden" animate="visible" variants={defaultVariants}>
        <p>
          Learn more about my work experience, my focus areas, and what I&apos;m currently working
          on.
        </p>

        <div className="not-prose">
          <Jobs jobs={jobs} />
        </div>
      </WorkShell>
    </section>
  );
}
