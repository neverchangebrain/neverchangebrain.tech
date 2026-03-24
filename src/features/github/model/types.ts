export type GithubStats = {
  issues: number;
  prs: number;
  followers: number;
  stars: number;
};

export type GithubContributionDay = {
  color: string;
  contributionCount: number;
  date: string;
};

export type GithubContributionWeek = {
  contributionDays: GithubContributionDay[];
};

export type GithubContributions = {
  totalContributions: number;
  latestContributions: GithubContributionWeek[];
  maxContributionDay: GithubContributionDay;
};
