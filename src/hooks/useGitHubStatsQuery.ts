import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { fetchGitHubStats, type GitHubStats } from '../services/githubApi'

export const GITHUB_STATS_QUERY_KEY = ['github', 'stats'] as const

export function useGitHubStatsQuery(): UseQueryResult<GitHubStats> {
  return useQuery({
    queryKey: GITHUB_STATS_QUERY_KEY,
    queryFn: fetchGitHubStats,
    meta: { source: 'github-stats' },
  })
}
