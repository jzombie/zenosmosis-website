export interface GitHubStats {
  user: {
    login: string;
    name: string;
    bio: string;
    public_repos: number;
    followers: number;
    following: number;
  };
  recentActivity: Array<{
    repo: string;
    message: string;
    date: string;
    url: string;
  }>;
}

const GITHUB_USERNAME = 'jzombie';

export async function fetchGitHubStats(): Promise<GitHubStats> {
  try {
    // Fetch user info
    const userResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
    const user = await userResponse.json();

    // Fetch recent events (commits, pushes, etc.)
    const eventsResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=10`);
    const events = await eventsResponse.json();

    // Parse recent commits/pushes
    const recentActivity = events
      .filter((event: any) => event.type === 'PushEvent')
      .slice(0, 5)
      .map((event: any) => ({
        repo: event.repo.name,
        message: event.payload.commits?.[0]?.message || 'Push event',
        date: new Date(event.created_at).toLocaleDateString(),
        url: `https://github.com/${event.repo.name}`
      }));

    return {
      user: {
        login: user.login,
        name: user.name,
        bio: user.bio,
        public_repos: user.public_repos,
        followers: user.followers,
        following: user.following,
      },
      recentActivity,
    };
  } catch (error) {
    console.error('Failed to fetch GitHub stats:', error);
    throw error;
  }
}
