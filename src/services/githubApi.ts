import { appConfig } from '../config/appConfig';

export type GitHubActivityType = 'push' | 'pull_request';

export interface GitHubActivityCommit {
  sha: string;
  message: string;
  url: string;
}

export interface GitHubActivityPullRequest {
  number: number;
  title: string;
  state: 'open' | 'closed';
  isMerged: boolean;
}

export interface GitHubActivityItem {
  id: string;
  type: GitHubActivityType;
  repo: string;
  summary: string;
  date: string;
  url: string;
  branch?: string;
  commits?: GitHubActivityCommit[];
  pullRequest?: GitHubActivityPullRequest;
}

export interface GitHubHighlight {
  label: string;
  value: string;
  subtitle?: string;
  href?: string;
}

export interface GitHubLanguageSlice {
  language: string;
  bytes: number;
}

export interface GitHubContributorStat {
  login: string;
  commits: number;
  avatarUrl: string;
  profileUrl: string;
}

export interface GitHubStats {
  user: {
    login: string;
    name: string;
    bio: string;
    public_repos: number;
    followers: number;
    following: number;
    public_gists: number;
  };
  highlights: GitHubHighlight[];
  languageDistribution: GitHubLanguageSlice[];
  topContributors: GitHubContributorStat[];
  recentActivity: GitHubActivityItem[];
}

function createResponseError(response: Response, endpoint: string) {
  const error: any = new Error(`GitHub request failed (${response.status}) for ${endpoint}`);
  error.status = response.status;
  error.endpoint = endpoint;
  return error;
}

export async function fetchGitHubStats(): Promise<GitHubStats> {
  try {
    const {
      username: githubUsername,
      recentActivityLimit,
      eventsPerPage,
      repoSampleSize,
    } = appConfig.github;
    // Fetch user info
    const userResponse = await fetch(`https://api.github.com/users/${githubUsername}`);
    if (!userResponse.ok) {
      throw createResponseError(userResponse, 'users');
    }
    const user = await userResponse.json();

    // Fetch recent events (commits, pushes, PRs, etc.)
    const eventsResponse = await fetch(
      `https://api.github.com/users/${githubUsername}/events?per_page=${eventsPerPage}`
    );
    const events = eventsResponse.ok ? await eventsResponse.json() : [];

    // Fetch repository summaries for aggregate stats
    const reposResponse = await fetch(
      `https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=updated`
    );
    const repos = reposResponse.ok ? await reposResponse.json() : [];

    const formatTimestamp = (isoDate: string) => {
      const date = new Date(isoDate);
      const datePart = date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timePart = date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${datePart} • ${timePart}`;
    };

    const recentActivity: GitHubActivityItem[] = [];

    if (Array.isArray(events)) {
      for (const event of events) {
        if (recentActivity.length >= recentActivityLimit) {
          break;
        }

        if (event.type === 'PushEvent') {
          const commits = Array.isArray(event.payload?.commits)
            ? event.payload.commits.slice(0, 5).map((commit: any) => ({
                sha: commit.sha,
                message: commit.message || 'Commit',
                url: `https://github.com/${event.repo.name}/commit/${commit.sha}`,
              }))
            : [];

          const commitCount = event.payload?.commits?.length ?? 0;
          const branch = (event.payload?.ref || '').replace('refs/heads/', '');

          recentActivity.push({
            id: event.id,
            type: 'push',
            repo: event.repo.name,
            summary:
              commitCount > 0
                ? `${commitCount} ${commitCount === 1 ? 'commit' : 'commits'} pushed to ${branch || 'default branch'}`
                : `Push to ${branch || 'repository'}`,
            date: formatTimestamp(event.created_at),
            url: branch
              ? `https://github.com/${event.repo.name}/tree/${encodeURIComponent(branch)}`
              : `https://github.com/${event.repo.name}`,
            branch,
            commits,
          });
        }

        if (event.type === 'PullRequestEvent') {
          const pr = event.payload?.pull_request;
          if (!pr) continue;

          recentActivity.push({
            id: event.id,
            type: 'pull_request',
            repo: event.repo.name,
            summary: `PR #${pr.number} ${event.payload?.action || 'updated'}`,
            date: formatTimestamp(event.created_at),
            url: pr.html_url,
            pullRequest: {
              number: pr.number,
              title: pr.title,
              state: pr.state,
              isMerged: Boolean(pr.merged_at),
            },
          });
        }
      }
    }

    let totalStars = 0;
    let totalForks = 0;
    let totalOpenIssues = 0;
    let starredRepoCount = 0;

    const prioritizedRepos: any[] = [];
    const languageTotals = new Map<string, number>();
    const contributorTotals = new Map<string, GitHubContributorStat>();

    if (Array.isArray(repos)) {
      const reposForPrioritization = repos
        .filter((repo: any) => !repo?.fork)
        .sort(
          (a: any, b: any) => (b?.stargazers_count ?? 0) - (a?.stargazers_count ?? 0)
        );

  prioritizedRepos.push(...reposForPrioritization.slice(0, repoSampleSize));

      for (const repo of repos) {
        const stars = repo?.stargazers_count ?? 0;
        const forks = repo?.forks_count ?? 0;
        const openIssues = repo?.open_issues_count ?? 0;

        totalStars += stars;
        totalForks += forks;
        totalOpenIssues += openIssues;
        if (stars > 0) starredRepoCount += 1;
      }

      await Promise.all(
        prioritizedRepos.map(async (repo: any) => {
          await Promise.all([
            (async () => {
              if (typeof repo?.languages_url !== 'string') return;
              try {
                const languagesResponse = await fetch(repo.languages_url);
                if (!languagesResponse.ok) return;
                const languagesData = await languagesResponse.json();
                for (const [language, bytes] of Object.entries(languagesData)) {
                  if (typeof language !== 'string' || typeof bytes !== 'number') continue;
                  languageTotals.set(language, (languageTotals.get(language) ?? 0) + bytes);
                }
              } catch (langError) {
                console.warn('Failed to load language data for repo', repo?.name, langError);
              }
            })(),
            (async () => {
              if (typeof repo?.contributors_url !== 'string') return;
              try {
                const contributorsResponse = await fetch(`${repo.contributors_url}?per_page=10`);
                if (!contributorsResponse.ok) return;
                const contributorsData = await contributorsResponse.json();
                if (!Array.isArray(contributorsData)) return;
                for (const contributor of contributorsData) {
                  const login = contributor?.login;
                  if (typeof login !== 'string' || login === githubUsername) continue;
                  const contributions = contributor?.contributions ?? 0;
                  const existing = contributorTotals.get(login) ?? {
                    login,
                    commits: 0,
                    avatarUrl: contributor?.avatar_url ?? '',
                    profileUrl: contributor?.html_url ?? `https://github.com/${login}`,
                  };
                  existing.commits += contributions;
                  if (!existing.avatarUrl && contributor?.avatar_url) {
                    existing.avatarUrl = contributor.avatar_url;
                  }
                  if (!existing.profileUrl && contributor?.html_url) {
                    existing.profileUrl = contributor.html_url;
                  }
                  contributorTotals.set(login, existing);
                }
              } catch (contribError) {
                console.warn('Failed to load contributor data for repo', repo?.name, contribError);
              }
            })(),
          ]);
        })
      );
    }

    const languageDistribution = Array.from(languageTotals.entries())
      .map(([language, bytes]) => ({ language, bytes }))
      .filter((slice) => slice.bytes > 0)
      .sort((a, b) => b.bytes - a.bytes);

    const totalLanguageBytes = languageDistribution.reduce((sum, slice) => sum + slice.bytes, 0);
    const topLanguage = languageDistribution[0];

    const topContributors = Array.from(contributorTotals.values())
      .filter((contributor) => contributor.commits > 0)
      .sort((a, b) => b.commits - a.commits)
      .slice(0, 6);

    const highlights: GitHubHighlight[] = [
      {
        label: 'Repositories',
        value: user.public_repos.toLocaleString(),
        href: `https://github.com/${githubUsername}?tab=repositories&type=source`,
        subtitle: 'Public projects',
      },
      {
        label: 'Total Stars',
        value: totalStars.toLocaleString(),
        href: `https://github.com/${githubUsername}?tab=repositories&type=source`,
        subtitle:
          starredRepoCount > 0
            ? `Across ${starredRepoCount.toLocaleString()} repos`
            : 'No stars yet',
      },
    ];

    if (topLanguage && totalLanguageBytes > 0) {
      const languagePercentage = Math.round((topLanguage.bytes / totalLanguageBytes) * 100);
      highlights.push({
        label: 'Top Language',
        value: topLanguage.language,
        href: `https://github.com/search?q=user%3A${githubUsername}+language%3A${encodeURIComponent(
          topLanguage.language
        )}&type=repositories`,
        subtitle: `${languagePercentage}% of sampled code`,
      });
    }

    if (user.public_gists > 0) {
      highlights.push({
        label: 'Public Gists',
        value: user.public_gists.toLocaleString(),
        href: `https://gist.github.com/${githubUsername}`,
        subtitle: 'Code snippets & notes',
      });
    }

    if (totalForks > 0) {
      highlights.push({
        label: 'Forks',
        value: totalForks.toLocaleString(),
        href: `https://github.com/${githubUsername}?tab=repositories&type=source`,
        subtitle: 'Total across repos',
      });
    }

    if (totalOpenIssues > 0) {
      highlights.push({
        label: 'Open Issues',
        value: totalOpenIssues.toLocaleString(),
        subtitle: 'Issues across public repos',
      });
    }

    return {
      user: {
        login: user.login,
        name: user.name,
        bio: user.bio,
        public_repos: user.public_repos,
        followers: user.followers,
        following: user.following,
        public_gists: user.public_gists,
      },
      highlights,
      languageDistribution,
      topContributors,
      recentActivity,
    };
  } catch (error) {
    console.error('Failed to fetch GitHub stats:', error);
    throw error;
  }
}
