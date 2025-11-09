import { useState, useEffect, type KeyboardEvent } from 'react';
import { fetchGitHubStats, type GitHubStats } from '../services/githubApi';
import { fetchCrateDownloadStats, type CrateDownloadSeries } from '../services/cratesApi';
import { LanguageDistributionChart } from './charts/LanguageDistributionChart';
import { ContributorImpactChart } from './charts/ContributorImpactChart';
import { CrateDownloadTrends } from './charts/CrateDownloadTrends';
import './SidePanel.css';

export function SidePanel() {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [crateMetrics, setCrateMetrics] = useState<CrateDownloadSeries[]>([]);
  const [crateError, setCrateError] = useState<string | null>(null);

  const openExternalLink = (targetUrl?: string) => {
    if (!targetUrl) return;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      try {
        const [githubResult, crateResult] = await Promise.all([
          fetchGitHubStats().catch((err) => {
            console.error('Failed to load GitHub stats', err);
            return null;
          }),
          fetchCrateDownloadStats().catch((err) => {
            console.error('Failed to load crates.io stats', err);
            return null;
          }),
        ]);

        if (!mounted) {
          return;
        }

        if (githubResult) {
          setStats(githubResult);
          setError(null);
        } else {
          setStats(null);
          setError('Failed to load GitHub stats');
        }

        if (crateResult) {
          setCrateMetrics(crateResult);
          setCrateError(null);
        } else {
          setCrateMetrics([]);
          setCrateError('Failed to load crates.io statistics');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

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
        <h2 className="side-panel-title">GitHub Activity</h2>
        
        {loading && (
          <div className="thinking-animation">
            <div className="thinking-dot"></div>
            <div className="thinking-dot"></div>
            <div className="thinking-dot"></div>
            <span className="thinking-text">Loading stats...</span>
          </div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        {stats && !loading && (
          <>
            <h3>{stats.user.name}</h3>
            <div className="activity-section">
              <h4>Recent Open-Source Activity</h4>
              {stats.recentActivity.length > 0 ? (
                <ul className="activity-list">
                  {stats.recentActivity.map((activity) => {
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
                            {activity.commits.map((commit) => (
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
                  {stats.highlights.map((metric) => {
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
                <h4>Language Footprint</h4>
                <LanguageDistributionChart data={stats.languageDistribution} />
              </div>
            )}

            {stats.topContributors.length > 0 && (
              <div className="chart-section">
                <h4>Top Contributors</h4>
                <ContributorImpactChart contributors={stats.topContributors} />
              </div>
            )}
          </>
        )}
      </div>

      {!loading && crateError && (
        <div className="error-message">{crateError}</div>
      )}

      {!loading && crateMetrics.length > 0 && (
        <div className="chart-section">
          <h4>Crate Downloads</h4>
          <CrateDownloadTrends data={crateMetrics} />
        </div>
      )}
    </aside>
    </>
  );
}
