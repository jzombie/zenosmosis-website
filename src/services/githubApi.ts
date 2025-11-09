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
  recentActivity: GitHubActivityItem[];
}

const GITHUB_USERNAME = 'jzombie';

export async function fetchGitHubStats(): Promise<GitHubStats> {
  try {
    // Fetch user info
    const userResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
    if (!userResponse.ok) {
      throw new Error(`GitHub user request failed with status ${userResponse.status}`);
    }
    const user = await userResponse.json();

    // Fetch recent events (commits, pushes, PRs, etc.)
    const eventsResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=20`);
    const events = eventsResponse.ok ? await eventsResponse.json() : [];

    // Fetch repository summaries for aggregate stats
    const reposResponse = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`
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
        if (recentActivity.length >= 6) {
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
    const languageCounts = new Map<string, number>();

    if (Array.isArray(repos)) {
      for (const repo of repos) {
        const stars = repo?.stargazers_count ?? 0;
        const forks = repo?.forks_count ?? 0;
        const openIssues = repo?.open_issues_count ?? 0;
        const language = repo?.language;

        totalStars += stars;
        totalForks += forks;
        totalOpenIssues += openIssues;
        if (stars > 0) starredRepoCount += 1;
        if (typeof language === 'string' && language.trim().length) {
          languageCounts.set(language, (languageCounts.get(language) ?? 0) + 1);
        }
      }
    }

    const sortedLanguages = Array.from(languageCounts.entries()).sort((a, b) => b[1] - a[1]);
    const topLanguage = sortedLanguages[0];

    const highlights: GitHubHighlight[] = [
      {
        label: 'Repositories',
        value: user.public_repos.toLocaleString(),
        href: `https://github.com/${GITHUB_USERNAME}?tab=repositories&type=source`,
        subtitle: 'Public projects',
      },
      {
        label: 'Total Stars',
        value: totalStars.toLocaleString(),
        href: `https://github.com/${GITHUB_USERNAME}?tab=repositories&type=source`,
        subtitle:
          starredRepoCount > 0
            ? `Across ${starredRepoCount.toLocaleString()} repos`
            : 'No stars yet',
      },
    ];

    if (topLanguage) {
      const [languageName, repoCount] = topLanguage;
      highlights.push({
        label: 'Top Language',
        value: languageName,
        href: `https://github.com/search?q=user%3A${GITHUB_USERNAME}+language%3A${encodeURIComponent(
          languageName
        )}&type=repositories`,
        subtitle: `${repoCount.toLocaleString()} repos`,
      });
    }

    if (user.public_gists > 0) {
      highlights.push({
        label: 'Public Gists',
        value: user.public_gists.toLocaleString(),
        href: `https://gist.github.com/${GITHUB_USERNAME}`,
        subtitle: 'Code snippets & notes',
      });
    }

    if (totalForks > 0) {
      highlights.push({
        label: 'Forks',
        value: totalForks.toLocaleString(),
        href: `https://github.com/${GITHUB_USERNAME}?tab=repositories&type=source`,
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
      recentActivity,
    };
  } catch (error) {
    console.error('Failed to fetch GitHub stats:', error);
    throw error;
  }
}
