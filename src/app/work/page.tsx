import { Jobs } from '@/app/work/components/jobs';
import { WorkShell } from '@/app/work/components/work-shell';
import { Heading } from '@/components/heading';
import { defaultVariants } from '@/constants/motion-variants';
import { toWorkJobs } from '@/features/experience/model';
import { getExperiences } from '@/features/experience/service';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Work - Nazar',
  description: "Learn more about my work experience and what I'm currently working on.",
};

export default async function WorkPage() {
  const experiences = await getExperiences();
  const jobs = toWorkJobs(experiences);

  return (
    <section>
      <Heading className="mt-0 mb-1">My work experience</Heading>

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
