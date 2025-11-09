import type { GitHubContributorStat } from '../../services/githubApi';

interface ContributorImpactChartProps {
  contributors: GitHubContributorStat[];
}

export function ContributorImpactChart({ contributors }: ContributorImpactChartProps) {
  if (!contributors.length) {
    return null;
  }

  const maxCommits = Math.max(...contributors.map((contributor) => contributor.commits));
  if (maxCommits <= 0) {
    return null;
  }

  return (
    <div className="chart-card contributor-chart">
      <ul className="contributor-list">
        {contributors.map((contributor) => {
          const barWidth = Math.round((contributor.commits / maxCommits) * 100);
          return (
            <li key={contributor.login} className="contributor-item">
              <a
                className="contributor-profile"
                href={contributor.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="contributor-avatar"
                  src={contributor.avatarUrl || `https://github.com/${contributor.login}.png`}
                  alt=""
                  loading="lazy"
                />
                <div className="contributor-meta">
                  <span className="contributor-name">{contributor.login}</span>
                  <span className="contributor-commits">{contributor.commits.toLocaleString()} commits</span>
                </div>
              </a>
              <div className="contributor-bar" aria-hidden="true">
                <div className="contributor-bar-value" style={{ width: `${barWidth}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
