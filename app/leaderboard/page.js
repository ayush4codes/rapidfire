'use client';

import { useState } from 'react';

export default function LeaderboardPage() {
  const [secret, setSecret] = useState('');
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(
        `/api/leaderboard?secret=${encodeURIComponent(secret)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Unauthorized');
        setLoading(false);
        return;
      }

      setLeaderboard(data.leaderboard);
      setAuthenticated(true);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch leaderboard');
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-default';
  };

  return (
    <div className="leaderboard-page">
      <div className="container-wide">
        <div className="leaderboard-header">
          <h1 className="leaderboard-title">
            🏆 <span>Leaderboard</span>
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-size-sm)',
              marginTop: 'var(--space-sm)',
            }}
          >
            Admin-only view of all quiz results
          </p>
        </div>

        {!authenticated ? (
          <form
            className="leaderboard-secret-form"
            onSubmit={handleAuth}
          >
            <input
              type="password"
              className="input-field"
              placeholder="Enter admin secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? '...' : 'View'}
            </button>
          </form>
        ) : null}

        {error && (
          <div
            className="login-error"
            style={{
              maxWidth: '400px',
              margin: 'var(--space-lg) auto',
            }}
          >
            {error}
          </div>
        )}

        {authenticated && leaderboard && (
          <div className="animate-fade-in-up">
            {leaderboard.length === 0 ? (
              <div
                className="glass-card"
                style={{
                  padding: 'var(--space-3xl)',
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                }}
              >
                No results yet. Waiting for participants...
              </div>
            ) : (
              <div className="leaderboard-table-wrap">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Name</th>
                      <th>GitHub</th>
                      <th>Score</th>
                      <th>%</th>
                      <th>Avg Time</th>
                      <th>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => (
                      <tr key={entry.githubUsername}>
                        <td>
                          <span
                            className={`rank-badge ${getRankBadge(
                              entry.rank
                            )}`}
                          >
                            {entry.rank}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>
                          {entry.fullName}
                        </td>
                        <td>
                          <span className="github-link">
                            @{entry.githubUsername}
                          </span>
                        </td>
                        <td>
                          <strong>{entry.score}</strong>
                          <span
                            style={{
                              color: 'var(--text-muted)',
                            }}
                          >
                            /{entry.totalQuestions}
                          </span>
                          <span className="score-bar">
                            <span
                              className="score-bar-fill"
                              style={{
                                width: `${entry.percentage}%`,
                              }}
                            />
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              color:
                                entry.percentage >= 70
                                  ? 'var(--success)'
                                  : entry.percentage >= 40
                                  ? 'var(--warning)'
                                  : 'var(--error)',
                              fontWeight: 600,
                            }}
                          >
                            {entry.percentage}%
                          </span>
                        </td>
                        <td>
                          {(entry.avgTime / 1000).toFixed(1)}s
                        </td>
                        <td
                          style={{
                            color: 'var(--text-secondary)',
                            fontSize: 'var(--font-size-xs)',
                          }}
                        >
                          {formatDate(entry.completedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div
              style={{
                textAlign: 'center',
                marginTop: 'var(--space-xl)',
              }}
            >
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
                Total participants: {leaderboard.length}
              </div>
              <button 
                className="btn-secondary" 
                style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                onClick={async () => {
                  if (!window.confirm("Are you sure you want to clear the leaderboard? This will delete all results and user accounts, allowing everyone to retake the quiz.")) return;
                  try {
                    setLoading(true);
                    const res = await fetch(`/api/leaderboard?secret=${encodeURIComponent(secret)}`, { method: 'DELETE' });
                    if (res.ok) {
                      setLeaderboard([]);
                    } else {
                      const data = await res.json();
                      setError(data.error || 'Failed to clear');
                    }
                  } catch (err) {
                    setError('Network error');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                {loading ? '...' : '⚠️ Clear Leaderboard'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
