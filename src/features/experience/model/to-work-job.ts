import type { Experience } from './types';
import type { WorkJob } from './work-job';

export function toWorkJob(exp: Experience): WorkJob {
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
}

export function toWorkJobs(experiences: Experience[]): WorkJob[] {
  return experiences.map(toWorkJob);
}
