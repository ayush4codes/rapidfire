'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !githubUsername.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          githubUsername: githubUsername.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setLoading(false);
        return;
      }

      // Store user session
      sessionStorage.setItem('rf_user', JSON.stringify(data.user));
      router.push('/quiz');
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass-card">
        <div className="login-brand">
          <div className="login-icon">⚡</div>
          <h1 className="login-title">
            <span>Rapid Fire</span>
          </h1>
          <p className="login-subtitle">
            40 tech questions · 15 seconds each · One shot
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="input-group">
            <label className="input-label" htmlFor="fullName">
              Full Name
            </label>
            <div className="input-icon-wrap">
              <span className="input-icon">👤</span>
              <input
                id="fullName"
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="githubUsername">
              GitHub Username
            </label>
            <div className="input-icon-wrap">
              <span className="input-icon">🐙</span>
              <input
                id="githubUsername"
                type="text"
                className="input-field"
                placeholder="johndoe"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary login-btn"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Start Quiz →'}
          </button>
        </form>

        <div className="login-footer">
          One attempt only · Results are final
        </div>
      </div>
    </div>
  );
}
