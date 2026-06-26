import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import './Dashboard.css';
import Swal from 'sweetalert2';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, checkSession } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleConnectGitHub = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/login-url`);
      if (!response.ok) {
        throw new Error('Failed to get GitHub authorization URL');
      }
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Connection Failed',
        text: 'Failed to connect to GitHub. Please check if backend is running.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-logo">
          <span className="logo-icon">⚡</span>
          <span>GitFolio Dashboard</span>
        </div>
        <div className="nav-profile">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} className="nav-avatar" />
          ) : (
            <div className="nav-avatar-placeholder">{user?.username?.[0]?.toUpperCase()}</div>
          )}
          <span className="nav-username">@{user?.username}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>Welcome, <span className="gradient-text">{user?.name || user?.username}</span>!</h1>
          <p>This is your control center. Customize your portfolio settings and manage repository synchronization.</p>
        </header>

        <section className="dashboard-main-section">
          <div className="card welcome-card">
            <h2>Authentication Completed Successfully! 🚀</h2>
            
            {!user?.github_connected ? (
              <div className="github-connect-section">
                <p>To automatically sync your repositories, you need to connect your GitHub account.</p>
                <button 
                  className={`connect-github-btn ${loading ? 'loading' : ''}`}
                  onClick={handleConnectGitHub}
                  disabled={loading}
                >
                  {loading ? 'Connecting...' : (
                    <>
                      <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                      </svg>
                      Connect GitHub Account
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div>
                <p>✅ GitHub Connected Successfully!</p>
                <ul className="todo-list" style={{ marginTop: '1.5rem' }}>
                  <li className="todo-item pending">⏱ Phase 2: Repository Sync Engine (Next)</li>
                  <li className="todo-item pending">⏱ Phase 3: Premium Customizable Portfolio Themes</li>
                </ul>
              </div>
            )}
            
          </div>

          <div className="card info-card">
            <h2>How GitFolio Works 💡</h2>
            <p>GitFolio is your all-in-one developer portfolio generator. Here is what you can do:</p>
            <ul className="todo-list" style={{ marginTop: '1.5rem' }}>
              <li className="todo-item pending">
                <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>🔄</span> 
                <strong>Sync Repositories:</strong> We fetch your best GitHub projects automatically.
              </li>
              <li className="todo-item pending">
                <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>🎨</span> 
                <strong>Customize Aesthetics:</strong> Pick themes, fonts, and colors that match your style.
              </li>
              <li className="todo-item pending">
                <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>🚀</span> 
                <strong>Publish:</strong> Instantly deploy a live link to share with recruiters and peers.
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
