import { useState, type KeyboardEvent } from 'react';
import { useGitHubStatsQuery } from '../hooks/useGitHubStatsQuery';
import { useCrateDownloadsQuery } from '../hooks/useCrateDownloadsQuery';
import type {
  GitHubActivityCommit,
  GitHubActivityItem,
  GitHubHighlight,
} from '../services/githubApi';
import { LanguageDistributionChart } from './charts/LanguageDistributionChart';
import { ContributorImpactChart } from './charts/ContributorImpactChart';
import { CrateDownloadTrends } from './charts/CrateDownloadTrends';
import './SidePanel.css';

const GitHubLogoIcon = () => (
  <svg
    className="heading-icon github-icon"
    viewBox="0 0 16 16"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fillRule="evenodd"
      d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.52 7.52 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8"
    />
  </svg>
);

const RustGearIcon = () => (
  <svg
    className="heading-icon rust-icon"
    viewBox="0 0 106 106"
    aria-hidden="true"
    focusable="false"
  >
    <g transform="translate(53 53)">
      <path
        d="M-9 -15h13c8 0 8 8 0 8H-9ZM-40 22H0V11h-9V3H1c11 0 5 19 14 19H40V3h-6v2c0 8-9 7-10 2-1-5-5-9-6-9 15-8 6-24-6-24H-35v11h10V11H-40Z"
        fill="currentColor"
        stroke="none"
      />

      <mask id="rust-hole-mask">
        <rect x="-60" y="-60" width="120" height="120" fill="white" />
        {[0, 72, 144, 216, 288].map((angle) => (
          <circle key={angle} cx={0} cy={-40} r={3} transform={`rotate(${angle})`} fill="black" />
        ))}
      </mask>

      <g mask="url(#rust-hole-mask)">
        <circle r="43" fill="none" stroke="currentColor" strokeWidth={9} />
        {[0, 11.25, 22.5, 33.75, 45, 56.25, 67.5, 78.75, 90, 101.25, 112.5, 123.75, 135, 146.25, 157.5, 168.75, 180, 191.25, 202.5, 213.75, 225, 236.25, 247.5, 258.75, 270, 281.25, 292.5, 303.75, 315, 326.25, 337.5, 348.75].map(
          (angle) => (
            <polygon
              key={`cog-${angle}`}
              points="46 3 51 0 46 -3"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinejoin="round"
              fill="none"
              transform={`rotate(${angle})`}
            />
          ),
        )}

        {[0, 72, 144, 216, 288].map((angle) => (
          <polygon
            key={`mount-${angle}`}
            points="-7 -42 0 -35 7 -42"
            stroke="currentColor"
            strokeWidth={6}
            strokeLinejoin="round"
            fill="none"
            transform={`rotate(${angle})`}
          />
        ))}
      </g>
    </g>
  </svg>
);

export function SidePanel() {
  const [isOpen, setIsOpen] = useState(true);

  const githubQuery = useGitHubStatsQuery();
  const crateQuery = useCrateDownloadsQuery();

  const stats = githubQuery.data ?? null;
  const crateMetrics = crateQuery.data ?? [];

  const isInitialGithubLoad = githubQuery.isPending && !stats;
  const githubError = githubQuery.isError
    ? githubQuery.error instanceof Error
      ? githubQuery.error.message
      : 'Failed to load GitHub stats'
    : null;

  const isInitialCrateLoad = crateQuery.isPending && crateMetrics.length === 0;
  const crateError = crateQuery.isError
    ? crateQuery.error instanceof Error
      ? crateQuery.error.message
      : 'Failed to load crates.io statistics'
    : null;

  const openExternalLink = (targetUrl?: string) => {
    if (!targetUrl) return;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <button 
        className="side-panel-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <span className={`toggle-icon ${isOpen ? 'close' : 'open'}`}>
          {isOpen ? '✕' : '☰'}
        </span>
      </button>
      
      <aside className={`side-panel ${isOpen ? 'open' : 'closed'}`}>
        <div className="side-panel-content">
          <h2 className="side-panel-title">
            <GitHubLogoIcon />
            GitHub Activity
          </h2>

          {isInitialGithubLoad && (
            <div className="thinking-animation">
              <div className="thinking-dot"></div>
              <div className="thinking-dot"></div>
              <div className="thinking-dot"></div>
              <span className="thinking-text">Loading stats...</span>
            </div>
          )}

          {githubError && !stats && (
            <div className="error-message">{githubError}</div>
          )}

          {githubError && stats && (
            <div className="error-message">Displaying cached data while live stats refresh ({githubError})</div>
          )}

          {stats && (
            <>
              <h3>{stats.user.name}</h3>
              <div className="activity-section">
                <h4 className="chart-heading">Recent Open-Source Activity</h4>
                {stats.recentActivity.length > 0 ? (
                  <ul className="activity-list">
                    {stats.recentActivity.map((activity: GitHubActivityItem) => {
                    const isClickable = Boolean(activity.url);

                    const handleActivityKeyDown = (
                      event: KeyboardEvent<HTMLLIElement>
                    ) => {
                      if (!isClickable) return;
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openExternalLink(activity.url);
                      }
                    };

                    return (
                      <li
                        key={activity.id}
                        className={`activity-item${isClickable ? ' clickable' : ''}`}
                        role={isClickable ? 'button' : undefined}
                        tabIndex={isClickable ? 0 : undefined}
                        onClick={isClickable ? () => openExternalLink(activity.url) : undefined}
                        onKeyDown={handleActivityKeyDown}
                      >
                        <div className="activity-main">
                          <div className="activity-type">
                            {activity.type === 'push' ? 'Push' : 'Pull Request'}
                          </div>
                          <div className="activity-repo">{activity.repo}</div>
                          <div className="activity-summary">{activity.summary}</div>
                        </div>

                        {activity.type === 'push' && activity.commits && activity.commits.length > 0 && (
                          <div className="activity-commits">
                            {activity.commits.map((commit: GitHubActivityCommit) => (
                              <a
                                key={commit.sha}
                                href={commit.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="activity-commit-link"
                                onClick={(event) => event.stopPropagation()}
                                onKeyDown={(event) => event.stopPropagation()}
                              >
                                <span className="commit-sha">{commit.sha.slice(0, 7)}</span>
                                <span className="commit-message">{commit.message}</span>
                              </a>
                            ))}
                          </div>
                        )}

                        {activity.type === 'pull_request' && activity.pullRequest && (
                          <div className="activity-pr-meta">
                            <span
                              className={`pr-state ${activity.pullRequest.isMerged ? 'merged' : activity.pullRequest.state}`}
                            >
                              {activity.pullRequest.isMerged
                                ? 'Merged'
                                : activity.pullRequest.state === 'open'
                                ? 'Open'
                                : 'Closed'}
                            </span>
                            <span className="pr-title">{activity.pullRequest.title}</span>
                          </div>
                        )}

                        <div className="activity-date">{activity.date}</div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="no-activity">No recent activity</p>
              )}
            </div>

            <div className="stats-section">
              <p className="bio">{stats.user.bio}</p>
              {stats.highlights.length > 0 && (
                <div className="stats-grid">
                  {stats.highlights.map((metric: GitHubHighlight) => {
                    const content = (
                      <>
                        <span className="stat-value">{metric.value}</span>
                        <span className="stat-label">{metric.label}</span>
                        {metric.subtitle && <span className="stat-subtitle">{metric.subtitle}</span>}
                      </>
                    );

                    const isClickable = Boolean(metric.href);

                    return (
                      <div
                        key={metric.label}
                        className={`stat-item${isClickable ? ' clickable' : ''}`}
                        role={isClickable ? 'button' : undefined}
                        tabIndex={isClickable ? 0 : undefined}
                        onClick={isClickable ? () => openExternalLink(metric.href) : undefined}
                        onKeyDown={isClickable ? (event: KeyboardEvent<HTMLDivElement>) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openExternalLink(metric.href);
                          }
                        } : undefined}
                      >
                        {content}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {stats.languageDistribution.length > 0 && (
              <div className="chart-section">
                <h4 className="chart-heading">Language Footprint</h4>
                <LanguageDistributionChart data={stats.languageDistribution} />
              </div>
            )}

            {stats.topContributors.length > 0 && (
              <div className="chart-section">
                <h4 className="chart-heading">Top Contributors</h4>
                <ContributorImpactChart contributors={stats.topContributors} />
              </div>
            )}
            </>
          )}

          {!isInitialCrateLoad && crateError && crateMetrics.length === 0 && (
            <div className="error-message">{crateError}</div>
          )}

          {crateError && crateMetrics.length > 0 && (
            <div className="error-message">Showing cached crate data while live stats refresh ({crateError})</div>
          )}

          {!isInitialCrateLoad && crateMetrics.length === 0 && !crateError && (
            <p className="no-activity">No crates found</p>
          )}

          {crateMetrics.length > 0 && (
            <div className="chart-section">
              <h4 className="chart-heading">
                <RustGearIcon />
                Rust Crate Downloads
              </h4>
              <CrateDownloadTrends data={crateMetrics} />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
