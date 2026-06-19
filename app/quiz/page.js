'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function QuizPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);

  const timerRef = useRef(null);
  const questionStartTime = useRef(Date.now());

  // Check authentication
  useEffect(() => {
    const stored = sessionStorage.getItem('rf_user');
    if (!stored) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  // Fetch questions
  useEffect(() => {
    if (!user) return;

    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/questions');
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load questions');
          setLoading(false);
          return;
        }

        setQuestions(data.questions);
        setLoading(false);
      } catch (err) {
        setError('Failed to load questions. Please try again.');
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [user]);

  // Timer logic
  useEffect(() => {
    if (!quizStarted || isTransitioning) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleNextQuestion(-1); // Timeout — unanswered
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, quizStarted, isTransitioning]);

  const handleNextQuestion = useCallback(
    (optionIndex) => {
      if (isTransitioning) return;
      setIsTransitioning(true);

      clearInterval(timerRef.current);

      const timeTaken = Date.now() - questionStartTime.current;

      const newAnswer = {
        questionId: questions[currentIndex]._id,
        selectedOption: optionIndex,
        timeTaken,
      };

      const updatedAnswers = [...answers, newAnswer];
      setAnswers(updatedAnswers);

      // Check if quiz is complete
      if (currentIndex >= questions.length - 1) {
        submitQuiz(updatedAnswers);
        return;
      }

      // Transition to next question
      setTimeout(() => {
        const nextIndex = prev => prev + 1;
        setCurrentIndex(nextIndex);
        // We use function state updater above, but here we need the exact index to fetch timeLimit
        const nextIdx = currentIndex + 1;
        setSelectedOption(null);
        setTimeLeft(questions[nextIdx]?.timeLimit || 15);
        questionStartTime.current = Date.now();
        setIsTransitioning(false);
      }, 400);
    },
    [currentIndex, questions, answers, isTransitioning]
  );

  const handleOptionClick = (index) => {
    if (isTransitioning || selectedOption !== null) return;
    setSelectedOption(index);

    // Brief visual feedback before advancing
    setTimeout(() => {
      handleNextQuestion(index);
    }, 300);
  };

  const submitQuiz = async (finalAnswers) => {
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          answers: finalAnswers,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        sessionStorage.setItem('rf_results', JSON.stringify(data));
        router.push('/results');
      } else {
        setError(data.error || 'Failed to submit quiz');
      }
    } catch (err) {
      setError('Network error while submitting. Please try again.');
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(questions[0]?.timeLimit || 15);
    questionStartTime.current = Date.now();
  };

  // Timer progress for SVG ring
  const currentQuestion = questions[currentIndex];
  const timeLimit = currentQuestion?.timeLimit || 15;
  const circumference = 2 * Math.PI * 20;
  const timerProgress = ((timeLimit - timeLeft) / timeLimit) * circumference;
  const timerClass =
    timeLeft > (timeLimit * 0.5) ? 'timer-safe' : timeLeft > (timeLimit * 0.25) ? 'timer-warning' : 'timer-danger';

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">Loading questions...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="loading-container">
        <p className="login-error" style={{ maxWidth: '400px' }}>
          {error}
        </p>
        <button className="btn-secondary" onClick={() => router.push('/')}>
          ← Back to Home
        </button>
      </div>
    );
  }

  // Pre-start screen
  if (!quizStarted) {
    return (
      <div className="login-page">
        <div className="login-card glass-card" style={{ textAlign: 'center' }}>
          <div className="login-icon">🚀</div>
          <h2
            className="login-title"
            style={{ marginBottom: '8px' }}
          >
            Ready, {user?.fullName?.split(' ')[0]}?
          </h2>
          <p
            className="login-subtitle"
            style={{ marginBottom: '32px', lineHeight: '1.7' }}
          >
            You&apos;ll face {questions.length} tech questions.
            <br />
            10-20 seconds per question. No going back.
            <br />
            <strong style={{ color: 'var(--text-primary)' }}>
              This is your only attempt.
            </strong>
          </p>
          <button className="btn-primary login-btn" onClick={startQuiz}>
            ⚡ Begin Rapid Fire
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="quiz-page">
      <div className="container">
        {/* Header */}
        <div className="quiz-header">
          <div className="quiz-meta">
            <div className="quiz-question-count">
              <strong>{currentIndex + 1}</strong> / {questions.length}
            </div>
          </div>

          {/* Timer */}
          <div className="timer-container">
            <div className="timer-ring">
              <svg viewBox="0 0 48 48">
                <circle
                  className="timer-ring-bg"
                  cx="24"
                  cy="24"
                  r="20"
                />
                <circle
                  className={`timer-ring-progress ${timerClass}`}
                  cx="24"
                  cy="24"
                  r="20"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - timerProgress}
                />
              </svg>
              <span className={`timer-text ${timerClass}`}>{timeLeft}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="quiz-content">
          <div
            className={`question-card glass-card ${
              !isTransitioning ? 'animate-enter' : ''
            }`}
            key={currentIndex}
          >
            <div className="question-number">
              Question {currentIndex + 1}
            </div>
            <h2 className="question-text">{currentQuestion?.question}</h2>

            <div className="options-grid">
              {currentQuestion?.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-btn ${
                    selectedOption === index ? 'selected' : ''
                  }`}
                  onClick={() => handleOptionClick(index)}
                  disabled={isTransitioning || selectedOption !== null}
                >
                  <span className="option-letter">{LETTERS[index]}</span>
                  <span>{option}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
