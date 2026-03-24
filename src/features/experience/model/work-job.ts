export type WorkJob = {
  id: number;
  workType: string;
  companyName: string;
  companyUrl: string | null;
  position: string;
  description: string | null;
  targetTask: string | null;
  stack: string | null;
  joinedAt: string | null;
  leftAt: string | null;
  from: string;
  to: string;
  current: boolean;
};
