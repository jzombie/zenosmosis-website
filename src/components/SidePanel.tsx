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
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{stats.user.public_repos}</span>
                  <span className="stat-label">Repositories</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.user.followers}</span>
                  <span className="stat-label">Followers</span>
                </div>
              </div>
            </div>

            <div className="activity-section">
              <h4>Recent Activity</h4>
              {stats.recentActivity.length > 0 ? (
                <ul className="activity-list">
                  {stats.recentActivity.map((activity, index) => (
                    <li key={index} className="activity-item">
                      <a href={activity.url} target="_blank" rel="noopener noreferrer">
                        <div className="activity-repo">{activity.repo}</div>
                        <div className="activity-message">{activity.message}</div>
                        <div className="activity-date">{activity.date}</div>
                      </a>
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
