import 'server-only';

import { octokit } from '@/lib/octokit';
import { unstable_cache } from 'next/cache';

import type { GithubContributions, GithubStats } from '../model/types';

const LOGIN = 'justrawaccel';
const REVALIDATE_SECONDS = 60 * 60;

async function getGithubStatsUncached(): Promise<GithubStats> {
  const gql = String.raw;

  const { user } = await octokit.graphql<{
    user: {
      repositoriesContributedTo: { totalCount: number };
      pullRequests: { totalCount: number };
      openIssues: { totalCount: number };
      closedIssues: { totalCount: number };
      followers: { totalCount: number };
      repositories: {
        totalCount: number;
        nodes: {
          stargazers: { totalCount: number };
        }[];
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
      };
    };
  }>(
    gql`
      query ($login: String!) {
        user(login: $login) {
          pullRequests(first: 1) {
            totalCount
          }
          openIssues: issues(states: OPEN) {
            totalCount
          }
          closedIssues: issues(states: CLOSED) {
            totalCount
          }
          followers {
            totalCount
          }
          repositories(ownerAffiliations: OWNER, first: 100) {
            totalCount
            nodes {
              stargazers {
                totalCount
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `,
    { login: LOGIN },
  );

  return {
    issues: user.closedIssues.totalCount + user.openIssues.totalCount,
    prs: user.pullRequests.totalCount,
    followers: user.followers.totalCount,
    stars: user.repositories.nodes.reduce(
      (totalStars, repo) => totalStars + repo.stargazers.totalCount,
      0,
    ),
  };
}

async function getGithubContributionsUncached(): Promise<GithubContributions> {
  const gql = String.raw;

  const { user } = await octokit.graphql<{
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              color: string;
              contributionCount: number;
              date: string;
            }[];
          }[];
        };
      };
    };
  }>(
    gql`
      query ($login: String!) {
        user(login: $login) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  color
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }
    `,
    { login: LOGIN },
  );

  let maxContributionDay = { contributionCount: 0, date: '', color: '' };

  const weeklyContributions = user.contributionsCollection.contributionCalendar.weeks;
  for (let week of weeklyContributions) {
    for (let day of week.contributionDays) {
      if (day.contributionCount > maxContributionDay.contributionCount) {
        maxContributionDay = day;
      }
    }
  }

  const latestContributions = weeklyContributions.slice(-11);
  const totalContributions = user.contributionsCollection.contributionCalendar.totalContributions;

  return {
    totalContributions,
    latestContributions,
    maxContributionDay,
  };
}

export const getGithubStats = unstable_cache(getGithubStatsUncached, ['github-stats', LOGIN], {
  revalidate: REVALIDATE_SECONDS,
  tags: ['github'],
});

export const getGithubContributions = unstable_cache(
  getGithubContributionsUncached,
  ['github-contributions', LOGIN],
  {
    revalidate: REVALIDATE_SECONDS,
    tags: ['github'],
  },
);
