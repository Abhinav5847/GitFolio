import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import './Login.css';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login-url`);
      if (!response.ok) {
        throw new Error('Failed to get authorization URL');
      }
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to GitHub OAuth
      } else {
        throw new Error('No redirect URL returned from server');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to GitHub. Please check if backend is running.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Decorative background blobs */}
      <div className="bg-blob blob-purple"></div>
      <div className="bg-blob blob-cyan"></div>
      
      <header className="login-header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">GitFolio</span>
        </div>
      </header>

      <main className="login-main">
        <div className="hero-section">
          <h1 className="hero-title">
            Your Portfolio, <br />
            <span className="gradient-text">Automatically in Sync</span>
          </h1>
          <p className="hero-subtitle">
            Create a repository on GitHub. Watch your portfolio update instantly. 
            No manual updates, no server configurations, just pure showcase.
          </p>

          {error && <div className="error-message">{error}</div>}

          <button 
            className={`login-btn ${loading ? 'loading' : ''}`}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <svg className="github-icon" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.48 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                Connect with GitHub
              </>
            )}
          </button>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>Real-Time Updates</h3>
            <p>Listen to GitHub webhooks. When you push, your portfolio is updated in seconds.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Glassmorphic Themes</h3>
            <p>Stunning, premium themes custom-made for developers to stand out.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚙️</div>
            <h3>Full Customization</h3>
            <p>Select which repositories to show, pin favorites, and customize metadata.</p>
          </div>
        </div>
      </main>

      <footer className="login-footer">
        <p>&copy; {new Date().getFullYear()} GitFolio. All rights reserved.</p>
      </footer>
    </div>
  );
}
