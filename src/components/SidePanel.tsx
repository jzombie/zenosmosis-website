import { useState, useEffect, type KeyboardEvent } from 'react';
import { useGitHubStatsQuery } from '../hooks/useGitHubStatsQuery';
import { useCrateDownloadsQuery } from '../hooks/useCrateDownloadsQuery';
import type {
  GitHubActivityCommit,
  GitHubActivityItem,
  GitHubHighlight,
} from '../services/githubApi';
import { appConfig } from '../config/appConfig';
import { LanguageDistributionChart } from './charts/LanguageDistributionChart';
import { ContributorImpactChart } from './charts/ContributorImpactChart';
import { CrateDownloadTrends } from './charts/CrateDownloadTrends';
import { GitHubMark, RustGearMark } from './icons/BrandIcons';
import { LinkOut } from './LinkOut';
import { openLink } from '../utils/linking';
import './SidePanel.css';

const BranchIcon = () => (
  <svg viewBox="0 0 16 16" width={14} height={14} aria-hidden="true" focusable="false">
    <g fill="currentColor">
      <circle cx={4} cy={3} r={1.7} />
      <circle cx={4} cy={13} r={1.7} />
      <circle cx={11.5} cy={6} r={1.7} />
    </g>
    <path
      d="M4 4.9v5.2a3 3 0 0 0 3 3h1.65"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 4.9c0 2.25 1.85 4.1 4.1 4.1H11"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PullRequestIcon = () => (
  <svg viewBox="0 0 16 16" width={14} height={14} aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M7.75 1a.75.75 0 0 1 .75.75v1.5h.25A2.75 2.75 0 0 1 11.5 6v3.69a2.75 2.75 0 1 1-1.5 0V6a1.25 1.25 0 0 0-1.25-1.25H8.5v1.5a.75.75 0 0 1-1.5 0V1.75A.75.75 0 0 1 7.75 1ZM3.75 1A2.75 2.75 0 0 0 1 3.75v8.5a2.75 2.75 0 1 0 1.5 0V3.75A.75.75 0 0 1 3.75 3h.25V1.75A.75.75 0 0 1 5.25 1v1.5h.25a.75.75 0 0 1 .75.75v5.69a2.75 2.75 0 1 1-1.5 0V5.5H3.75A.75.75 0 0 1 3 4.75v-1A.75.75 0 0 1 3.75 3Zm0 12a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm7.5 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z"
    />
  </svg>
);

const truncateText = (value: string, maxLength = 160) => {
  if (value.length <= maxLength) return value;
  const truncated = value.slice(0, maxLength).trimEnd();
  return `${truncated.replace(/[\s.,;:-]*$/, '')}…`;
};

export function SidePanel() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(min-width: 769px)');

    const syncOpenState = () => {
      setIsOpen(mediaQuery.matches);
    };

    syncOpenState();

    const listener = () => syncOpenState();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', listener);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(listener);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', listener);
      } else if (typeof mediaQuery.removeListener === 'function') {
        mediaQuery.removeListener(listener);
      }
    };
  }, []);

  const githubQuery = useGitHubStatsQuery();
  const crateQuery = useCrateDownloadsQuery();

  const stats = githubQuery.data ?? null;
  const crateMetrics = crateQuery.data ?? [];

  const githubProfileUrl = `https://github.com/${appConfig.github.username}`;
  const cratesProfileUrl = `https://crates.io/users/${appConfig.crates.username}?sort=downloads`;

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
    openLink(targetUrl, { allowReferrer: false });
  };

  const resolvedIsOpen = isOpen ?? true;
  const isInitializing = isOpen === null;

  return (
    <>
      <button 
        className="side-panel-toggle"
        onClick={() => setIsOpen(!(isOpen ?? true))}
        aria-label={resolvedIsOpen ? 'Close sidebar' : 'Open sidebar'}
        disabled={isInitializing}
      >
        <span className={`toggle-icon ${resolvedIsOpen ? 'close' : 'open'}`}>
          {resolvedIsOpen ? '✕' : '☰'}
        </span>
      </button>
      
      <aside className={`side-panel ${resolvedIsOpen ? 'open' : 'closed'}${isInitializing ? ' initializing' : ''}`}>
        <div className="side-panel-content">
          <h2 className="side-panel-title">
            <GitHubMark className="heading-icon github-icon" />
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
              <div className="github-identity">
                <span className="github-name">{stats.user.name}</span>
                <LinkOut className="github-handle" href={githubProfileUrl} allowReferrer={false}>@{appConfig.github.username}</LinkOut>
              </div>
              <div className="profile-links" role="navigation" aria-label="Profile quick links">
                <LinkOut
                  className="profile-link"
                  href={githubProfileUrl}
                  allowReferrer={false}
                >
                  GitHub Profile
                </LinkOut>
                <LinkOut
                  className="profile-link"
                  href={cratesProfileUrl}
                  allowReferrer={false}
                >
                  crates.io Profile
                </LinkOut>
              </div>
              <div className="activity-section">
                <h4 className="chart-heading">Recent Open-Source Activity</h4>
                {stats.recentActivity.length > 0 ? (
                  <ul className="activity-list">
                    {stats.recentActivity.map((activity: GitHubActivityItem) => {
                      const isClickable = Boolean(activity.url);
                      const eventTypeLabel = activity.type.replace(/_/g, ' ');
                      const pushBranchLabel = activity.type === 'push'
                        ? activity.branch || 'default branch'
                        : null;
                      const pullRequestLabel =
                        activity.type === 'pull_request' && activity.pullRequest
                          ? `PR #${activity.pullRequest.number}`
                          : null;

                      const commitMessages =
                        activity.type === 'push' && activity.commits && activity.commits.length > 0
                          ? activity.commits
                              .map((commit) => commit.message?.trim().replace(/\s+/g, ' ') ?? '')
                              .filter(Boolean)
                          : [];

                      const summaryText =
                        activity.type === 'push'
                          ? commitMessages.length > 0
                            ? truncateText(
                                commitMessages.length > 1
                                  ? `${commitMessages[0]} (+${commitMessages.length - 1} more)`
                                  : commitMessages[0],
                              )
                            : activity.summary
                          : activity.summary;

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
                            <div className="activity-meta">
                              <span className="activity-type">{`Event type: ${eventTypeLabel}`}</span>
                              {pushBranchLabel && (
                                <span className={`activity-branch ${activity.type}`}>
                                  <BranchIcon />
                                  <span className="branch-name" title={pushBranchLabel}>
                                    {pushBranchLabel}
                                  </span>
                                </span>
                              )}
                              {pullRequestLabel && (
                                <span className={`activity-branch ${activity.type}`}>
                                  <PullRequestIcon />
                                  <span className="branch-name" title={pullRequestLabel}>
                                    {pullRequestLabel}
                                  </span>
                                </span>
                              )}
                            </div>
                            <div className="activity-repo">{activity.repo}</div>
                            {summaryText && (
                              <div className="activity-summary">{summaryText}</div>
                            )}
                          </div>

                          {activity.type === 'push' && activity.commits && activity.commits.length > 0 && (
                            <div className="activity-commits">
                              {activity.commits.map((commit: GitHubActivityCommit) => (
                                <LinkOut
                                  key={commit.sha}
                                  href={commit.url}
                                  className="activity-commit-link"
                                  allowReferrer={false}
                                  onClick={(event) => event.stopPropagation()}
                                  onKeyDown={(event) => event.stopPropagation()}
                                >
                                  <span className="commit-sha">{commit.sha.slice(0, 7)}</span>
                                  <span className="commit-message">{commit.message}</span>
                                </LinkOut>
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
                <RustGearMark className="heading-icon rust-icon" />
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
