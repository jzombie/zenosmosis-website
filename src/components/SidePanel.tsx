import { useState, useEffect } from 'react';
import { fetchGitHubStats, type GitHubStats } from '../services/githubApi';
import './SidePanel.css';

export function SidePanel() {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      try {
        const data = await fetchGitHubStats();
        if (mounted) {
          setStats(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load GitHub stats');
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
            <div className="stats-section">
              <h3>{stats.user.name}</h3>
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

                    return metric.href ? (
                      <a
                        key={metric.label}
                        className="stat-item stat-link"
                        href={metric.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {content}
                      </a>
                    ) : (
                      <div key={metric.label} className="stat-item">
                        {content}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="activity-section">
              <h4>Recent Activity</h4>
              {stats.recentActivity.length > 0 ? (
                <ul className="activity-list">
                  {stats.recentActivity.map((activity) => (
                    <li key={activity.id} className="activity-item">
                      <a
                        href={activity.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="activity-main-link"
                      >
                        <div className="activity-type">
                          {activity.type === 'push' ? 'Push' : 'Pull Request'}
                        </div>
                        <div className="activity-repo">{activity.repo}</div>
                        <div className="activity-summary">{activity.summary}</div>
                      </a>

                      {activity.type === 'push' && activity.commits && activity.commits.length > 0 && (
                        <div className="activity-commits">
                          {activity.commits.map((commit) => (
                            <a
                              key={commit.sha}
                              href={commit.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="activity-commit-link"
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
                  ))}
                </ul>
              ) : (
                <p className="no-activity">No recent activity</p>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
    </>
  );
}
