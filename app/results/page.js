'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('rf_results');
    if (!stored) {
      router.push('/');
      return;
    }
    setResults(JSON.parse(stored));
  }, [router]);

  if (!results) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">Loading results...</p>
      </div>
    );
  }

  const { score, totalQuestions, details } = results;
  const percentage = Math.round((score / totalQuestions) * 100);
  const correct = score;
  const wrong = details.filter(
    (d) => d.selectedOption !== -1 && !d.isCorrect
  ).length;
  const skipped = details.filter((d) => d.selectedOption === -1).length;

  const avgTime =
    Math.round(
      details.reduce((sum, d) => sum + (d.timeTaken || 15000), 0) /
        details.length /
        10
    ) / 100;

  // Score ring
  const circumference = 2 * Math.PI * 68;
  const scoreOffset = circumference - (percentage / 100) * circumference;
  const scoreClass =
    percentage >= 70 ? 'score-high' : percentage >= 40 ? 'score-mid' : 'score-low';

  const getMessage = () => {
    if (percentage >= 90) return '🔥 Outstanding! You crushed it!';
    if (percentage >= 70) return '⚡ Great job! Solid performance!';
    if (percentage >= 50) return '👍 Not bad! Room to grow.';
    if (percentage >= 30) return '💪 Keep learning, you\u0027ll get there!';
    return '📚 Time to hit the books!';
  };

  const LETTERS = ['A', 'B', 'C', 'D'];

  return (
    <div className="results-page">
      <div className="container">
        {/* Hero */}
        <div className="results-hero glass-card">
          <div className="results-badge">⚡ Quiz Complete</div>

          <div className="results-score-ring">
            <svg viewBox="0 0 160 160">
              <circle
                className="score-ring-bg"
                cx="80"
                cy="80"
                r="68"
              />
              <circle
                className={`score-ring-fill ${scoreClass}`}
                cx="80"
                cy="80"
                r="68"
                strokeDasharray={circumference}
                strokeDashoffset={scoreOffset}
              />
            </svg>
            <div className="results-score-text">
              <div className="results-score-number">
                {score}
              </div>
              <div className="results-score-label">
                out of {totalQuestions}
              </div>
            </div>
          </div>

          <div className="results-percentage">{percentage}%</div>
          <p className="results-message">{getMessage()}</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card glass-card">
            <div className="stat-value correct">✓ {correct}</div>
            <div className="stat-label">Correct</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-value wrong">✗ {wrong}</div>
            <div className="stat-label">Wrong</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-value skipped">⏭ {skipped}</div>
            <div className="stat-label">Skipped</div>
          </div>
        </div>

        {/* Average time */}
        <div
          className="glass-card"
          style={{
            padding: 'var(--space-lg)',
            textAlign: 'center',
            marginBottom: 'var(--space-2xl)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 'var(--space-xs)',
            }}
          >
            Avg. Time per Question
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 800,
              color: 'var(--text-primary)',
            }}
          >
            {avgTime}s
          </div>
        </div>

        {/* Review Toggle */}
        <button
          className="btn-secondary"
          style={{ width: '100%', marginBottom: 'var(--space-xl)' }}
          onClick={() => setShowReview(!showReview)}
        >
          {showReview ? 'Hide' : 'Show'} Answer Review{' '}
          {showReview ? '▲' : '▼'}
        </button>

        {/* Review Section */}
        {showReview && (
          <div className="review-section animate-fade-in">
            <h3 className="review-title">📋 Detailed Review</h3>
            <div className="review-list">
              {details.map((item, index) => {
                const status =
                  item.selectedOption === -1
                    ? 'skipped'
                    : item.isCorrect
                    ? 'correct'
                    : 'wrong';

                return (
                  <div
                    key={index}
                    className={`review-item ${status}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="review-q-header">
                      <span className="review-q-number">Q{index + 1}</span>
                      <span className={`review-q-status ${status}`}>
                        {status === 'correct'
                          ? '✓ Correct'
                          : status === 'wrong'
                          ? '✗ Wrong'
                          : '⏭ Skipped'}
                      </span>
                    </div>
                    <p className="review-q-text">{item.question}</p>
                    <div className="review-options">
                      {item.options?.map((opt, optIdx) => {
                        const isCorrectOpt = optIdx === item.correctAnswer;
                        const isSelectedOpt = optIdx === item.selectedOption;
                        const isWrong = isSelectedOpt && !item.isCorrect;

                        let className = 'review-option';
                        if (isCorrectOpt) className += ' is-correct';
                        if (isSelectedOpt && isWrong)
                          className += ' is-selected is-wrong';

                        return (
                          <div key={optIdx} className={className}>
                            <span className="review-option-icon">
                              {isCorrectOpt
                                ? '✓'
                                : isWrong
                                ? '✗'
                                : LETTERS[optIdx]}
                            </span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Back button */}
        <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
          <button
            className="btn-secondary"
            onClick={() => {
              sessionStorage.clear();
              router.push('/');
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
